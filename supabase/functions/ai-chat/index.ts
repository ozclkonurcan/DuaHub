/**
 * Rehber — AI dini soru-cevap asistanı (KF-1 v1).
 *
 * Güvenlik modeli:
 *  - ANTHROPIC_API_KEY yalnızca bu fonksiyonun secret'ında yaşar; uygulamaya asla inmez.
 *  - Kullanıcı JWT'si doğrulanır; kota (tek seferlik tanıtım hakkı / premium) sunucuda uygulanır.
 *  - Teolojik kırmızı çizgiler sistem promptunda (PRD KF-1): fetva yok, mezhep tarafsızlığı,
 *    emin olunmayan konuda dürüstlük, kriz durumlarında şefkatli yönlendirme.
 *
 * Deploy: supabase functions deploy ai-chat  (veya Dashboard → Edge Functions editörü)
 * Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...  (veya Dashboard → Functions → Secrets)
 *
 * v2 notları: RAG (pgvector, Diyanet kaynak korpusu) + streaming + prompt caching breakpoint'i
 * korpus parçalarını kapsayacak şekilde genişletilecek.
 */
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Sen "Rehber"sin — DuaHub uygulamasının İslami bilgi asistanısın. Türkçe konuşursun.

Kimliğin ve sınırların:
- Bir din alimi ya da müftü DEĞİLSİN; bağlayıcı dini hüküm (fetva) vermezsin. Kişiye özel fıkhi hüküm gerektiren sorularda (boşanma, miras, kişisel kefaret durumları vb.) genel bilgiyi ver ve mutlaka "kesin hüküm için İl/İlçe Müftülüğüne ya da Diyanet'in Alo 190 Fetva Hattına danışın" yönlendirmesi yap.
- Mezhepler arasında görüş farkı olan konularda tarafsız kal: yaygın görüşleri mezhep adlarıyla kısaca aktar, birini "doğru" ilan etme.
- Emin olmadığın hiçbir bilgiyi uydurma. Ayet/hadis zikrederken yalnızca yaygın olarak bilinen ve emin olduğun kaynakları an (ör. "Bakara 2:255", "Buhari'de geçen bir hadise göre..."); emin değilsen kaynak vermeden genel ifade kullan ve bunu belirt.
- Tıbbi, hukuki veya mali konularda profesyonel danışmanlık yerine geçmediğini söyle.
- Kullanıcı umutsuzluk, kendine zarar verme gibi bir kriz belirtisi gösterirse önce şefkatle karşıla ve profesyonel destek öner (Türkiye'de 182 / acil durumda 112).

Üslubun:
- Sıcak, saygılı, kısa ve net. Gereksiz uzatma; soruya odaklan.
- Cevabın sonunda uygun düşüyorsa tek cümlelik bir hatırlatma/dua önerebilirsin, zorlama.`;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // 1) Kullanıcıyı doğrula (kendi JWT'siyle)
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json(401, { error: "auth_required" });

    // 2) Kota kontrolü (service role — RLS üstü, sayaç sunucuda)
    const admin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: profile } = await admin
      .from("profiles")
      .select("is_premium, ai_trial_remaining")
      .eq("id", user.id)
      .single();
    if (!profile) return json(403, { error: "profile_missing" });
    if (!profile.is_premium && profile.ai_trial_remaining <= 0) {
      return json(402, { error: "trial_exhausted" });
    }

    // 3) Soruyu al (son 12 mesajla sınırla — bağlam + maliyet dengesi)
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return json(400, { error: "messages_required" });
    }
    const trimmed = messages.slice(-12).map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 4000),
    }));

    // 4) Claude çağrısı
    const anthropic = new Anthropic(); // ANTHROPIC_API_KEY secret'tan
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: trimmed,
    });

    if (response.stop_reason === "refusal") {
      return json(200, {
        text: "Bu soruya yanıt veremiyorum. Dini bir konuda güvenilir bilgi için İl/İlçe Müftülüğüne ya da Alo 190 Fetva Hattına danışabilirsin.",
        remaining: profile.is_premium ? null : profile.ai_trial_remaining,
      });
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("")
      .trim();

    // 5) Tanıtım hakkını düş (yalnızca başarılı cevapta)
    let remaining: number | null = null;
    if (!profile.is_premium) {
      remaining = profile.ai_trial_remaining - 1;
      await admin
        .from("profiles")
        .update({ ai_trial_remaining: remaining })
        .eq("id", user.id);
    }

    return json(200, { text, remaining });
  } catch (error) {
    console.error("ai-chat hata:", error);
    return json(500, { error: "internal", message: String(error) });
  }
});
