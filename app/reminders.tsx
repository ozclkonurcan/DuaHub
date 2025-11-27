// app/reminders.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import * as NotificationService from "../services/notificationService";
import * as PrayerTimesService from "../services/prayerTimesService";

export default function RemindersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [settings, setSettings] =
    useState<NotificationService.NotificationSettings | null>(null);
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [prayerTimes, setPrayerTimes] =
    useState<PrayerTimesService.PrayerTimes | null>(null);

  useEffect(() => {
    loadSettings();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Bildirim izni
    await NotificationService.registerForPushNotifications();

    // Konum izni
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });

      // Namaz vakitlerini al
      const times = await PrayerTimesService.getPrayerTimes(
        loc.coords.latitude,
        loc.coords.longitude
      );
      setPrayerTimes(times);
    }
  };

  const loadSettings = async () => {
    const savedSettings = await NotificationService.getNotificationSettings();
    setSettings(savedSettings);
  };

  const saveSettings = async (
    newSettings: NotificationService.NotificationSettings
  ) => {
    setSettings(newSettings);
    await NotificationService.saveNotificationSettings(newSettings);
    await updateNotifications(newSettings);
  };

  const updateNotifications = async (
    settings: NotificationService.NotificationSettings
  ) => {
    // Önce tüm bildirimleri iptal et
    await NotificationService.cancelAllNotifications();

    if (!settings.enabled) return;

    // Sabah duası
    if (settings.morningDua.enabled) {
      await NotificationService.scheduleMorningDua(settings.morningDua.time);
    }

    // Akşam duası
    if (settings.eveningDua.enabled) {
      await NotificationService.scheduleEveningDua(settings.eveningDua.time);
    }

    // Namaz vakitleri
    if (settings.prayerTimes.enabled && prayerTimes) {
      if (settings.prayerTimes.fajr) {
        const { hour, minute } = PrayerTimesService.parseTime(prayerTimes.fajr);
        await NotificationService.schedulePrayerNotification(
          "Sabah",
          hour,
          minute
        );
      }
      if (settings.prayerTimes.dhuhr) {
        const { hour, minute } = PrayerTimesService.parseTime(
          prayerTimes.dhuhr
        );
        await NotificationService.schedulePrayerNotification(
          "Öğle",
          hour,
          minute
        );
      }
      if (settings.prayerTimes.asr) {
        const { hour, minute } = PrayerTimesService.parseTime(prayerTimes.asr);
        await NotificationService.schedulePrayerNotification(
          "İkindi",
          hour,
          minute
        );
      }
      if (settings.prayerTimes.maghrib) {
        const { hour, minute } = PrayerTimesService.parseTime(
          prayerTimes.maghrib
        );
        await NotificationService.schedulePrayerNotification(
          "Akşam",
          hour,
          minute
        );
      }
      if (settings.prayerTimes.isha) {
        const { hour, minute } = PrayerTimesService.parseTime(prayerTimes.isha);
        await NotificationService.schedulePrayerNotification(
          "Yatsı",
          hour,
          minute
        );
      }
    }

    Alert.alert("Başarılı", "Hatırlatıcılar güncellendi");
  };

  const handleMorningTimeChange = (event: any, selectedDate?: Date) => {
    setShowMorningPicker(false);
    if (selectedDate && settings) {
      const time = `${selectedDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${selectedDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      saveSettings({
        ...settings,
        morningDua: { ...settings.morningDua, time },
      });
    }
  };

  const handleEveningTimeChange = (event: any, selectedDate?: Date) => {
    setShowEveningPicker(false);
    if (selectedDate && settings) {
      const time = `${selectedDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${selectedDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      saveSettings({
        ...settings,
        eveningDua: { ...settings.eveningDua, time },
      });
    }
  };

  if (!settings) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Hatırlatıcılar
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ana Anahtar */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>
                Tüm Hatırlatıcılar
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(value) =>
                saveSettings({ ...settings, enabled: value })
              }
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        {/* Sabah Duası */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Günlük Dualar
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="sunny" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Sabah Duası
                  </Text>
                  <Text style={[styles.settingSubtext, { color: colors.icon }]}>
                    {settings.morningDua.time}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.morningDua.enabled}
                onValueChange={(value) =>
                  saveSettings({
                    ...settings,
                    morningDua: { ...settings.morningDua, enabled: value },
                  })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            {settings.morningDua.enabled && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowMorningPicker(true)}
              >
                <Text
                  style={[styles.timeButtonText, { color: colors.primary }]}
                >
                  Saati Değiştir
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showMorningPicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleMorningTimeChange}
            />
          )}

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon" size={24} color={colors.primary} />
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>
                    Akşam Duası
                  </Text>
                  <Text style={[styles.settingSubtext, { color: colors.icon }]}>
                    {settings.eveningDua.time}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.eveningDua.enabled}
                onValueChange={(value) =>
                  saveSettings({
                    ...settings,
                    eveningDua: { ...settings.eveningDua, enabled: value },
                  })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
            {settings.eveningDua.enabled && (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEveningPicker(true)}
              >
                <Text
                  style={[styles.timeButtonText, { color: colors.primary }]}
                >
                  Saati Değiştir
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showEveningPicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleEveningTimeChange}
            />
          )}
        </View>

        {/* Namaz Vakitleri */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Namaz Vakitleri
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Namaz Vakti Hatırlatmaları
                </Text>
              </View>
              <Switch
                value={settings.prayerTimes.enabled}
                onValueChange={(value) =>
                  saveSettings({
                    ...settings,
                    prayerTimes: { ...settings.prayerTimes, enabled: value },
                  })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {settings.prayerTimes.enabled && prayerTimes && (
              <View style={styles.prayerTimesContainer}>
                {[
                  { key: "fajr", name: "Sabah", time: prayerTimes.fajr },
                  { key: "dhuhr", name: "Öğle", time: prayerTimes.dhuhr },
                  { key: "asr", name: "İkindi", time: prayerTimes.asr },
                  { key: "maghrib", name: "Akşam", time: prayerTimes.maghrib },
                  { key: "isha", name: "Yatsı", time: prayerTimes.isha },
                ].map((prayer) => (
                  <View key={prayer.key} style={styles.prayerRow}>
                    <View>
                      <Text style={[styles.prayerName, { color: colors.text }]}>
                        {prayer.name}
                      </Text>
                      <Text style={[styles.prayerTime, { color: colors.icon }]}>
                        {prayer.time}
                      </Text>
                    </View>
                    <Switch
                      value={
                        settings.prayerTimes[
                          prayer.key as keyof typeof settings.prayerTimes
                        ] as boolean
                      }
                      onValueChange={(value) =>
                        saveSettings({
                          ...settings,
                          prayerTimes: {
                            ...settings.prayerTimes,
                            [prayer.key]: value,
                          },
                        })
                      }
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                    />
                  </View>
                ))}
              </View>
            )}

            {settings.prayerTimes.enabled && !prayerTimes && (
              <View style={styles.locationWarning}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.error}
                />
                <Text
                  style={[styles.locationWarningText, { color: colors.error }]}
                >
                  Konum izni gerekli
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ramazan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ramazan Özel
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Ramazan Hatırlatmaları
                </Text>
              </View>
              <Switch
                value={settings.ramadan.enabled}
                onValueChange={(value) =>
                  saveSettings({
                    ...settings,
                    ramadan: { ...settings.ramadan, enabled: value },
                  })
                }
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {settings.ramadan.enabled && (
              <View style={styles.ramadanOptions}>
                <View style={styles.prayerRow}>
                  <Text style={[styles.prayerName, { color: colors.text }]}>
                    İftar Vakti
                  </Text>
                  <Switch
                    value={settings.ramadan.iftar}
                    onValueChange={(value) =>
                      saveSettings({
                        ...settings,
                        ramadan: { ...settings.ramadan, iftar: value },
                      })
                    }
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
                <View style={styles.prayerRow}>
                  <Text style={[styles.prayerName, { color: colors.text }]}>
                    Sahur Vakti
                  </Text>
                  <Switch
                    value={settings.ramadan.sahur}
                    onValueChange={(value) =>
                      saveSettings({
                        ...settings,
                        ramadan: { ...settings.ramadan, sahur: value },
                      })
                    }
                    trackColor={{ false: colors.border, true: colors.primary }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bilgi */}
        <View
          style={[styles.infoCard, { backgroundColor: colors.primary + "10" }]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Namaz vakitleri konumunuza göre otomatik olarak hesaplanır. Konum
            izni vermeniz gerekiyor.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  timeButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  prayerTimesContainer: {
    marginTop: 16,
    gap: 12,
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prayerName: {
    fontSize: 15,
    fontWeight: "500",
  },
  prayerTime: {
    fontSize: 13,
    marginTop: 2,
  },
  locationWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  locationWarningText: {
    fontSize: 13,
  },
  ramadanOptions: {
    marginTop: 16,
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
