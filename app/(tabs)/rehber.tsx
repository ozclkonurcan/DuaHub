import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { Button, Card, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/core/theme/useThemeColors";
import { useRehberChat } from "@/features/ai/useRehberChat";
import { useSession } from "@/features/auth/useAuth";

const SAMPLE_QUESTIONS = [
  "Seferi iken namaz nasıl kılınır?",
  "Nazara karşı hangi dualar okunur?",
  "Oruçluyken ilaç kullanmak orucu bozar mı?",
];

export default function RehberScreen() {
  const colors = useThemeColors();
  const { session, configured } = useSession();
  const { messages, busy, error, remaining, exhausted, send } =
    useRehberChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question) return;
    setInput("");
    send(question);
  };

  // Girişsiz durum — Rehber hesap ister (kota hesaba bağlı)
  if (configured && !session) {
    return (
      <Screen className="items-center justify-center">
        <View className="items-center px-8">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-raised">
            <Ionicons name="sparkles" size={34} color={colors.primary} />
          </View>
          <Text variant="title" className="text-center">
            Rehber
          </Text>
          <Text variant="caption" className="mt-3 text-center leading-5">
            Güvenilir kaynaklara saygılı, haddini bilen yapay zekâ asistanı.
            Denemek için giriş yap — ilk 10 soru hediye.
          </Text>
          <Link href="/auth" asChild>
            <Pressable className="mt-6 w-full">
              <Button title="Giriş Yap" onPress={() => {}} />
            </Pressable>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Başlık + kalan hak */}
        <View className="mb-3 mt-2 flex-row items-center justify-between">
          <Text variant="title">Rehber</Text>
          {remaining !== null ? (
            <View className="rounded-full bg-gold/15 px-2.5 py-1">
              <Text className="text-xs font-bold text-gold">
                Deneme: {remaining} soru
              </Text>
            </View>
          ) : null}
        </View>

        {/* Mesajlar */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View className="items-center pt-10">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-raised">
                <Ionicons name="sparkles" size={28} color={colors.primary} />
              </View>
              <Text variant="caption" className="mb-5 px-8 text-center leading-5">
                Dini sorularını sor; kaynaklara saygılı, ihtiyatlı cevaplar
                vereyim. Fetva gerektiren konularda seni müftülüğe yönlendiririm.
              </Text>
              {SAMPLE_QUESTIONS.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => handleSend(q)}
                  className="mb-2 rounded-2xl border border-border bg-surface px-4 py-2.5 active:opacity-70"
                >
                  <Text variant="caption" className="font-medium text-ink">
                    {q}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            messages.map((message, i) => (
              <View
                key={i}
                className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "self-end rounded-br-md bg-primary"
                    : "self-start rounded-bl-md border border-border bg-surface"
                }`}
              >
                <Text
                  className={`leading-6 ${
                    message.role === "user" ? "text-on-primary" : "text-ink"
                  }`}
                >
                  {message.content}
                </Text>
              </View>
            ))
          )}
          {busy ? (
            <View className="mb-3 self-start rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-3">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null}
          {error ? (
            <Text className="mb-2 text-center text-sm text-red-400">
              {error}
            </Text>
          ) : null}
        </ScrollView>

        {/* Tanıtım hakkı bitti → Plus teaser */}
        {exhausted ? (
          <Card className="mb-2 items-center bg-raised py-4">
            <Ionicons name="star" size={20} color={colors.gold} />
            <Text className="mt-2 text-center font-semibold">
              Tanıtım soruların bitti
            </Text>
            <Text variant="caption" className="mt-1 px-6 text-center text-xs">
              Sınırsız Rehber, DuaHub Plus ile geliyor — çok yakında.
            </Text>
          </Card>
        ) : (
          <View className="mb-1 flex-row items-end gap-2">
            <View className="flex-1 flex-row items-center rounded-2xl border border-border bg-surface px-3">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Sorunu yaz…"
                placeholderTextColor={colors.muted}
                multiline
                className="max-h-24 flex-1 py-3 text-base text-ink"
              />
            </View>
            <Pressable
              onPress={() => handleSend()}
              disabled={busy || input.trim().length === 0}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                busy || input.trim().length === 0 ? "bg-raised" : "bg-primary"
              } active:opacity-80`}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={
                  busy || input.trim().length === 0
                    ? colors.muted
                    : colors.onPrimary
                }
              />
            </Pressable>
          </View>
        )}

        <Text className="pb-1 text-center text-[10px] text-muted">
          Rehber bir yapay zekâdır; bağlayıcı dini hüküm (fetva) vermez.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}
