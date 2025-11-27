// app/(tabs)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
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
import { Colors } from "../../constants/Colors";
import * as StorageService from "../../services/storageService";
import i18n from "../../utils/i18n";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    colorScheme === "dark"
  );
  const [language, setLanguage] = useState(i18n.locale);
  const [stats, setStats] = useState({
    totalDuasRead: 0,
    currentStreak: 0,
    favoritesCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const storedLang = await AsyncStorage.getItem('user-language');
      if (storedLang) {
        setLanguage(storedLang);
      }
      // Note: Theme persistence would ideally be handled in a root context,
      // but for now we toggle the UI state here.
    } catch (e) {
      console.error("Settings load error", e);
    }
  };

  const loadStats = async () => {
    const userStats = await StorageService.getUserStats();
    const favorites = await StorageService.getFavorites();

    setStats({
      totalDuasRead: userStats.totalDuasRead,
      currentStreak: userStats.currentStreak,
      favoritesCount: favorites.length,
    });
  };

  const toggleLanguage = async () => {
    const newLang = language.startsWith('tr') ? 'en' : 'tr';
    i18n.locale = newLang;
    setLanguage(newLang);
    await AsyncStorage.setItem('user-language', newLang);
    // Force refresh or alert user to restart if needed,
    // though React state usually triggers re-render if I18n is used reactively.
    // Since i18n-js isn't reactive by default, we might need a context.
    // For now, we just update local state to reflect change.
    Alert.alert(i18n.t("languageChanged"), i18n.t("restartApp"));
  };

  const handlePremium = () => {
    router.push("/premium");
  };

  const handleReminders = () => {
    router.push("/reminders");
  };

  const handleShare = async () => {
    try {
      Alert.alert("Uygulamayı Paylaş", "DuaHub'ı arkadaşlarınla paylaş!", [
        { text: "İptal", style: "cancel" },
        {
          text: "Paylaş",
          onPress: () => {
            // TODO: Share.share() ile paylaş
          },
        },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRate = () => {
    Alert.alert(
      "Uygulamayı Değerlendir",
      "Bizi Play Store'da değerlendirerek destekleyebilirsiniz!",
      [{ text: "Tamam" }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "DuaHub Hakkında",
      "Versiyon: 1.0.0\n\nDuaHub, günlük dualarınızı organize etmenize ve sesli olarak dinlemenize yardımcı olur.\n\n© 2025 DuaHub",
      [{ text: "Tamam" }]
    );
  };

  const handleQibla = () => {
    router.push("/qibla");
  };

  const handlePlaylists = () => {
    router.push("/playlists");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* İstatistikler */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalDuasRead}
            </Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              Okunan Dua
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              Gün Streak
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.error }]}>
              {stats.favoritesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>
              Favori
            </Text>
          </View>
        </View>

        {/* Premium Bölümü */}
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: colors.accent }]}
          onPress={handlePremium}
        >
          <View style={styles.premiumContent}>
            <Ionicons name="star" size={32} color="#FFFFFF" />
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Premium a Geçin</Text>
              <Text style={styles.premiumSubtitle}>
                Tüm özelliklerin kilidini açın
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Araçlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Araçlar
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.settingItem} onPress={handleQibla}>
              <View style={styles.settingLeft}>
                <Ionicons name="compass" size={24} color={colors.primary} />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Kıble Pusulası
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handlePlaylists}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Dinleme Listeleri
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleReminders}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="alarm" size={24} color={colors.primary} />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Hatırlatıcılar
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ayarlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ayarlar
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Bildirimler
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Karanlık Mod
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

             <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

             <TouchableOpacity style={styles.settingItem} onPress={toggleLanguage}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="language-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Dil / Language
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.icon }]}>
                  {language.toUpperCase()}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.icon}
                />
              </View>
            </TouchableOpacity>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="text-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Yazı Boyutu
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.icon }]}>
                  Orta
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.icon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Diğer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Diğer
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.settingItem} onPress={handleShare}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="share-social-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Uygulamayı Paylaş
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity style={styles.settingItem} onPress={handleRate}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Değerlendir
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View
              style={[
                styles.dividerHorizontal,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Hakkında
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.version, { color: colors.icon }]}>
          Versiyon 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: "100%",
  },
  dividerHorizontal: {
    height: 1,
    width: "100%",
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  premiumText: {
    gap: 4,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 16,
  },
});
