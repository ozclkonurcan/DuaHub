/**
 * Supabase istemcisi.
 * Anahtarlar .env'den gelir (EXPO_PUBLIC_* değişkenleri build'e gömülür —
 * anon/publishable key zaten halka açık tasarlanmıştır; güvenlik RLS'tedir).
 * Yapılandırılmamışsa null döner: uygulama çevrimdışı çekirdekle çalışmaya devam eder.
 */
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        // Web'de varsayılan localStorage kullanılır; native'de AsyncStorage şart.
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
