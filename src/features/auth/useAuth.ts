import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { isSupabaseConfigured, supabase } from "@/core/api/supabase";

interface SessionState {
  session: Session | null;
  loading: boolean;
  /** false ise .env'de Supabase anahtarları yok — hesap özellikleri gizlenir. */
  configured: boolean;
}

export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    );
    return () => subscription.subscription.unsubscribe();
  }, []);

  return { session, loading, configured: isSupabaseConfigured };
}

/** Supabase hata mesajlarını kullanıcıya uygun Türkçeye çevirir. */
function toTurkishError(message: string): string {
  const map: [RegExp, string][] = [
    [/invalid login credentials/i, "E-posta veya şifre hatalı."],
    [/user already registered/i, "Bu e-posta ile zaten bir hesap var."],
    [/password should be at least/i, "Şifre en az 6 karakter olmalı."],
    [/unable to validate email|invalid email/i, "Geçerli bir e-posta adresi gir."],
    [/email not confirmed/i, "E-postanı doğrulamadan giriş yapamazsın — gelen kutunu kontrol et."],
    [/rate limit/i, "Çok fazla deneme yapıldı; biraz bekleyip tekrar dene."],
    [/network|fetch/i, "Bağlantı kurulamadı — internetini kontrol et."],
  ];
  for (const [pattern, tr] of map) if (pattern.test(message)) return tr;
  return "Bir şeyler ters gitti: " + message;
}

export type AuthResult =
  | { ok: true; needsEmailConfirm?: boolean }
  | { ok: false; error: string };

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: "Hesap servisi yapılandırılmadı." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: toTurkishError(error.message) };
  return { ok: true };
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!supabase) return { ok: false, error: "Hesap servisi yapılandırılmadı." };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: toTurkishError(error.message) };
  // "Confirm email" açıksa oturum dönmez; kullanıcıyı bilgilendir.
  return { ok: true, needsEmailConfirm: !data.session };
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}
