import { useState } from "react";

import { supabase } from "@/core/api/supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RehberState {
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  /** null = premium (sınırsız); sayı = kalan tanıtım hakkı. */
  remaining: number | null;
  exhausted: boolean;
  send: (text: string) => Promise<void>;
}

export function useRehberChat(): RehberState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [exhausted, setExhausted] = useState(false);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy || !supabase) return;

    setError(null);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: question },
    ];
    setMessages(nextMessages);
    setBusy(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "ai-chat",
        { body: { messages: nextMessages } },
      );

      if (fnError) {
        // Non-2xx: gövdedeki hata kodunu çöz (402 = tanıtım hakkı bitti)
        let code = "internal";
        try {
          const body = await (
            fnError as { context?: Response }
          ).context?.json();
          code = body?.error ?? code;
        } catch {
          // gövde yoksa jenerik hata
        }
        if (code === "trial_exhausted") {
          setExhausted(true);
          setRemaining(0);
        } else if (code === "auth_required") {
          setError("Rehber'i kullanmak için giriş yapmalısın.");
        } else {
          setError("Cevap alınamadı — biraz sonra tekrar dene.");
        }
        // Soruyu geri al ki kullanıcı tekrar gönderebilsin
        setMessages(messages);
        return;
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.text as string },
      ]);
      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
        if (data.remaining <= 0) setExhausted(true);
      } else {
        setRemaining(null);
      }
    } catch {
      setError("Bağlantı kurulamadı — internetini kontrol et.");
      setMessages(messages);
    } finally {
      setBusy(false);
    }
  };

  return { messages, busy, error, remaining, exhausted, send };
}
