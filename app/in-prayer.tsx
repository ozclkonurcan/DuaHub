import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Switch, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import * as SMS from 'expo-sms';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";
import { Ionicons } from "@expo/vector-icons";

export default function InPrayerScreen() {
  const { colors } = useTheme();
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(false);
  const [smsMessage, setSmsMessage] = useState("Şu an namaz kılıyorum, size daha sonra dönüş yapacağım.");
  const [smsAvailable, setSmsAvailable] = useState(false);

  useEffect(() => {
    checkSmsAvailability();
    loadSettings();
  }, []);

  const checkSmsAvailability = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    setSmsAvailable(isAvailable);
  };

  const loadSettings = async () => {
    try {
      const storedEnabled = await AsyncStorage.getItem("inPrayer_autoSmsEnabled");
      const storedMessage = await AsyncStorage.getItem("inPrayer_smsMessage");
      if (storedEnabled !== null) setAutoSmsEnabled(storedEnabled === "true");
      if (storedMessage !== null) setSmsMessage(storedMessage);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("inPrayer_autoSmsEnabled", String(autoSmsEnabled));
      await AsyncStorage.setItem("inPrayer_smsMessage", smsMessage);
      Alert.alert("Başarılı", "Ayarlar kaydedildi.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestSms = async () => {
    if (smsAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [],
        smsMessage
      );
      // Note: Expo SMS opens the native SMS composer. It cannot send silently in background without user interaction on iOS/Android managed workflow.
      // We clarify this to the user in the UI.
    } else {
      Alert.alert("Hata", "SMS servisi bu cihazda kullanılamıyor.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <ThemedButton
            title=""
            icon="arrow-back"
            variant="ghost"
            onPress={() => router.back()}
            style={{ width: 40 }}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Namazdayım Modu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
                Namazdayım modu, namaz esnasında gelen aramaları reddetmenize yardımcı olur.
                iOS ve Android kısıtlamaları nedeniyle aramalar otomatik reddedilemez, ancak bu ekranı açık tutarak hızlıca SMS gönderebilirsiniz.
            </Text>
        </View>

        <ThemedCard style={styles.card}>
            <View style={styles.row}>
                <View>
                    <Text style={[styles.label, { color: colors.text }]}>Otomatik SMS Modu</Text>
                    <Text style={[styles.subLabel, { color: colors.icon }]}>Namaz vakitlerinde aktifleştir</Text>
                </View>
                <Switch
                    value={autoSmsEnabled}
                    onValueChange={setAutoSmsEnabled}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
        </ThemedCard>

        <ThemedCard style={styles.card}>
            <Text style={[styles.label, { color: colors.text, marginBottom: 10 }]}>SMS Mesajı</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={smsMessage}
                onChangeText={setSmsMessage}
                multiline
                numberOfLines={3}
            />
            <Text style={[styles.hint, { color: colors.icon }]}>Bu mesaj arayan kişilere gönderilecektir.</Text>
        </ThemedCard>

        <View style={styles.actions}>
            <ThemedButton title="Kaydet" onPress={saveSettings} style={styles.button} />
            <ThemedButton title="SMS Test Et" variant="outline" onPress={handleTestSms} style={styles.button} />
        </View>

        {/* Feature Teaser for "Silent Mode" */}
        <ThemedCard style={[styles.card, { marginTop: 20, opacity: 0.7 }]}>
            <View style={styles.row}>
                <View>
                    <Text style={[styles.label, { color: colors.text }]}>Otomatik Sessiz Mod</Text>
                    <Text style={[styles.subLabel, { color: colors.icon }]}>Namaz vaktinde telefonu sessize al</Text>
                </View>
                <Switch
                    value={false}
                    disabled
                />
            </View>
            <Text style={[styles.hint, { color: colors.accent, marginTop: 10 }]}>
                * Bu özellik işletim sistemi kısıtlamaları nedeniyle şu an aktif değildir.
            </Text>
        </ThemedCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  infoBox: {
      flexDirection: 'row',
      gap: 12,
      padding: 12,
      marginBottom: 8,
  },
  infoText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
  },
  card: {
      marginBottom: 10,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  label: {
      fontSize: 16,
      fontWeight: '600',
  },
  subLabel: {
      fontSize: 13,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      textAlignVertical: 'top',
      fontSize: 16,
  },
  hint: {
      fontSize: 12,
      marginTop: 8,
  },
  actions: {
      gap: 12,
      marginTop: 10,
  },
  button: {
      width: '100%',
  }
});
