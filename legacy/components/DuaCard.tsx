// components/DuaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import * as StorageService from "../services/storageService";
import { Dua } from "../types/dua";

interface DuaCardProps {
  dua: Dua;
  onFavoriteToggle?: (duaId: string) => void;
  showCategory?: boolean;
}

export default function DuaCard({
  dua,
  onFavoriteToggle,
  showCategory = true,
}: DuaCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [isFavorite, setIsFavorite] = useState(false);
  const [readCount, setReadCount] = useState(0);

  // Component mount olduğunda favori ve okuma sayısını yükle
  useEffect(() => {
    loadDuaData();
  }, [dua.id]);

  const loadDuaData = async () => {
    const favorite = await StorageService.isFavorite(dua.id);
    const count = await StorageService.getReadCount(dua.id);

    setIsFavorite(favorite);
    setReadCount(count);
  };

  const handlePress = () => {
    router.push(`/dua/${dua.id}`);
  };

  const handleFavorite = async (e: any) => {
    e.stopPropagation();

    if (isFavorite) {
      await StorageService.removeFavorite(dua.id);
      setIsFavorite(false);
    } else {
      await StorageService.addFavorite(dua.id);
      setIsFavorite(true);
    }

    // Parent component'e de bildir (eğer varsa)
    onFavoriteToggle?.(dua.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Başlık ve Premium Badge */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {dua.title}
        </Text>
        <View style={styles.badges}>
          {dua.isPremium && (
            <View
              style={[styles.premiumBadge, { backgroundColor: colors.accent }]}
            >
              <Ionicons name="star" size={10} color="#FFFFFF" />
            </View>
          )}
          <TouchableOpacity
            onPress={handleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? colors.error : colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arapça metin - kısa önizleme */}
      <Text style={[styles.arabic, { color: colors.text }]} numberOfLines={2}>
        {dua.arabic}
      </Text>

      {/* Meal - kısa önizleme */}
      <Text style={[styles.meaning, { color: colors.icon }]} numberOfLines={2}>
        {dua.meaning}
      </Text>

      {/* Alt bilgi */}
      <View style={styles.footer}>
        {showCategory && (
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {dua.category}
            </Text>
          </View>
        )}

        {readCount > 0 && (
          <View style={styles.readCount}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
            />
            <Text style={[styles.readCountText, { color: colors.icon }]}>
              {readCount}x okundu
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  premiumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  arabic: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: "right",
    fontWeight: "500",
    marginBottom: 8,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  readCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readCountText: {
    fontSize: 12,
  },
});
