import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import {
  signInWithEmail,
  signUpWithEmail,
  useSession,
} from "@/features/auth/useAuth";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { configured } = useSession();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError("E-posta ve şifre gerekli.");
      return;
    }
    setBusy(true);
    const result =
      mode === "signin"
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(email.trim(), password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirm) {
      setInfo(
        "Hesabın oluşturuldu! E-postana gelen doğrulama bağlantısına tıkla, sonra buradan giriş yap.",
      );
      setMode("signin");
      return;
    }
    router.back();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Başlık + geri */}
        <View className="mb-6 mt-2 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-raised active:opacity-70"
          >
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
          <Text variant="title">
            {mode === "signin" ? "Giriş Yap" : "Hesap Oluştur"}
          </Text>
        </View>

        <View className="flex-1 justify-center pb-24">
          <View className="mb-6 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-[20px] bg-primary">
              <Ionicons name="moon" size={30} color={colors.onPrimary} />
            </View>
            <Text variant="caption" className="mt-3 text-center leading-5">
              Hesabınla zincirin, favorilerin ve kaldığın yer{"\n"}tüm
              cihazlarında güvende olur.
            </Text>
          </View>

          {!configured ? (
            <Card className="mb-4 flex-row items-start gap-3">
              <Ionicons name="construct-outline" size={18} color={colors.gold} />
              <Text variant="caption" className="flex-1 leading-5">
                Hesap servisi henüz yapılandırılmadı (.env içinde Supabase
                anahtarı eksik). Geliştirme notu — kullanıcılar bunu görmez.
              </Text>
            </Card>
          ) : null}

          <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
            <Ionicons name="mail-outline" size={16} color={colors.muted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              className="flex-1 py-3.5 text-base text-ink"
            />
          </View>
          <View className="mb-4 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3">
            <Ionicons name="lock-closed-outline" size={16} color={colors.muted} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Şifre (en az 6 karakter)"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoComplete={mode === "signin" ? "password" : "new-password"}
              className="flex-1 py-3.5 text-base text-ink"
            />
          </View>

          {error ? (
            <Text className="mb-3 text-sm font-medium text-red-400">
              {error}
            </Text>
          ) : null}
          {info ? (
            <Text className="mb-3 text-sm font-medium text-primary">
              {info}
            </Text>
          ) : null}

          {busy ? (
            <View className="items-center py-3.5">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <Button
              title={mode === "signin" ? "Giriş Yap" : "Hesap Oluştur"}
              onPress={handleSubmit}
              disabled={!configured}
              className={!configured ? "opacity-50" : ""}
            />
          )}

          <Pressable
            onPress={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 items-center active:opacity-70"
          >
            <Text variant="caption">
              {mode === "signin" ? (
                <>
                  Hesabın yok mu?{" "}
                  <Text className="text-sm font-bold text-primary">
                    Kayıt ol
                  </Text>
                </>
              ) : (
                <>
                  Zaten hesabın var mı?{" "}
                  <Text className="text-sm font-bold text-primary">
                    Giriş yap
                  </Text>
                </>
              )}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
