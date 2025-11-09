// app/dua/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import * as StorageService from "../../services/storageService";
import { Dua } from "../../types/dua";

export default function DuaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [dua, setDua] = useState<Dua | null>(null);
  const [readCount, setReadCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDua();
  }, [id]);

  const loadDua = async () => {
    const allDuas = duasData.duas as Dua[];
    const foundDua = allDuas.find((d) => d.id === id);

    if (foundDua) {
      setDua(foundDua);

      // AsyncStorage'dan veriyi yükle
      const count = await StorageService.getReadCount(id);
      const favorite = await StorageService.isFavorite(id);

      setReadCount(count);
      setIsFavorite(favorite);
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!dua) return;
    const text = `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.meaning}`;
    await Clipboard.setStringAsync(text);
    Alert.alert("Kopyalandı", "Dua panoya kopyalandı");
  };

  const handleShare = async () => {
    if (!dua) return;
    try {
      await Share.share({
        message: `${dua.title}\n\n${dua.arabic}\n\n${dua.meaning}\n\nDuaHub uygulamasından paylaşıldı.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async () => {
    if (!dua) return;

    const newCount = await StorageService.incrementReadCount(dua.id);
    await StorageService.updateUserStats();

    setReadCount(newCount);

    Alert.alert("Tebrikler! 🎉", `Bu duayı ${newCount} kez okudunuz.`, [
      { text: "Tamam" },
    ]);
  };

  const handleFavoriteToggle = async () => {
    if (!dua) return;

    if (isFavorite) {
      await StorageService.removeFavorite(dua.id);
      setIsFavorite(false);
    } else {
      await StorageService.addFavorite(dua.id);
      setIsFavorite(true);
      Alert.alert("Favorilere Eklendi", "Dua favorilerinize eklendi");
    }
  };

  if (loading) {
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

  if (!dua) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Dua bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {dua.title}
          </Text>
          {dua.isPremium && (
            <View
              style={[styles.premiumBadge, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="star" size={16} color="#FFFFFF" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Arapça Metin */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.icon }]}>
            Arapça
          </Text>
          <Text style={[styles.arabic, { color: colors.text }]}>
            {dua.arabic}
          </Text>
        </View>

        {/* Okunuşu */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.icon }]}>
            Okunuşu
          </Text>
          <Text style={[styles.transliteration, { color: colors.text }]}>
            {dua.transliteration}
          </Text>
        </View>

        {/* Meal */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.icon }]}>
            Anlamı
          </Text>
          <Text style={[styles.meaning, { color: colors.text }]}>
            {dua.meaning}
          </Text>
        </View>

        {/* Faydası */}
        {dua.benefit && (
          <View
            style={[styles.card, { backgroundColor: colors.primary + "10" }]}
          >
            <View style={styles.benefitHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                Ne Zaman Okunur?
              </Text>
            </View>
            <Text style={[styles.benefit, { color: colors.text }]}>
              {dua.benefit}
            </Text>
          </View>
        )}

        {/* Kaynak */}
        {dua.source && (
          <View style={styles.sourceContainer}>
            <Ionicons name="book-outline" size={16} color={colors.icon} />
            <Text style={[styles.source, { color: colors.icon }]}>
              Kaynak: {dua.source}
            </Text>
          </View>
        )}

        {/* Okuma Sayacı */}
        {readCount > 0 && (
          <View style={styles.readCountContainer}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
            <Text style={[styles.readCountText, { color: colors.icon }]}>
              Bu duayı {readCount} kez okudunuz
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Alt Butonlar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleFavoriteToggle}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? colors.error : colors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleCopy}
        >
          <Ionicons name="copy-outline" size={24} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleMarkAsRead}
        >
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Okudum</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  premiumText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  arabic: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: "right",
    fontWeight: "500",
  },
  transliteration: {
    fontSize: 16,
    lineHeight: 28,
    fontStyle: "italic",
  },
  meaning: {
    fontSize: 16,
    lineHeight: 28,
  },
  benefitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  benefit: {
    fontSize: 15,
    lineHeight: 24,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  source: {
    fontSize: 14,
    fontStyle: "italic",
  },
  readCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  readCountText: {
    fontSize: 14,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
