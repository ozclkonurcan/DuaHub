// app/playlist/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import duasData from "../../data/duas.json";
import * as PlaylistService from "../../services/playlistService";
import { Dua } from "../../types/dua";

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [playlist, setPlaylist] = useState<any>(null);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadPlaylist();
    }, [id])
  );

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const loadPlaylist = async () => {
    const list = await PlaylistService.getPlaylist(id);
    if (list) {
      setPlaylist(list);

      // Duaları yükle
      const allDuas = duasData.duas as Dua[];
      const playlistDuas = allDuas.filter((dua) =>
        list.duaIds.includes(dua.id)
      );
      setDuas(playlistDuas);
    }
  };

  const handleRemoveDua = async (duaId: string) => {
    Alert.alert(
      "Duayı Çıkar",
      "Bu duayı listeden çıkarmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkar",
          style: "destructive",
          onPress: async () => {
            await PlaylistService.removeDuaFromPlaylist(id, duaId);
            loadPlaylist();
          },
        },
      ]
    );
  };

  const handlePlayAll = async () => {
    if (duas.length === 0) {
      Alert.alert("Uyarı", "Listede dua bulunmuyor");
      return;
    }

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setCurrentIndex(0);
    playDuaAtIndex(0);
  };

  const playDuaAtIndex = async (index: number) => {
    if (index >= duas.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      Alert.alert("Tamamlandı", "Tüm dualar okundu!");
      return;
    }

    const dua = duas[index];
    setCurrentIndex(index);

    await Speech.speak(dua.arabic, {
      language: "ar",
      pitch: 1.0,
      rate: 0.7,
      onDone: () => {
        // Sonraki duaya geç
        setTimeout(() => {
          playDuaAtIndex(index + 1);
        }, 1000); // 1 saniye ara
      },
      onStopped: () => {
        setIsPlaying(false);
      },
    });
  };

  const handleAddDuas = () => {
    router.push(`/playlist/${id}/add-duas`);
  };

  if (!playlist) {
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
        <Text
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {playlist.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Playlist Info */}
      <View
        style={[styles.playlistHeader, { backgroundColor: playlist.color }]}
      >
        <View style={styles.playlistIconLarge}>
          <Ionicons name="musical-notes" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.playlistNameLarge}>{playlist.name}</Text>
        {playlist.description && (
          <Text style={styles.playlistDescLarge}>{playlist.description}</Text>
        )}
        <Text style={styles.playlistCountLarge}>{duas.length} dua</Text>

        {/* Play All Button */}
        <TouchableOpacity
          style={[
            styles.playAllButton,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
          onPress={handlePlayAll}
        >
          <Ionicons
            name={isPlaying ? "stop-circle" : "play-circle"}
            size={32}
            color="#FFFFFF"
          />
          <Text style={styles.playAllText}>
            {isPlaying ? "Durdur" : "Tümünü Çal"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Duas List */}
      {duas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={60}
            color={colors.icon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Listede dua yok
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddDuas}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Dua Ekle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {duas.map((dua, index) => (
            <View
              key={dua.id}
              style={[
                styles.duaCard,
                { backgroundColor: colors.card },
                isPlaying &&
                  index === currentIndex && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
              ]}
            >
              <View style={styles.duaInfo}>
                <Text style={[styles.duaTitle, { color: colors.text }]}>
                  {dua.title}
                </Text>
                <Text
                  style={[styles.duaArabic, { color: colors.icon }]}
                  numberOfLines={1}
                >
                  {dua.arabic}
                </Text>
              </View>

              <View style={styles.duaActions}>
                {isPlaying && index === currentIndex && (
                  <Ionicons
                    name="volume-high"
                    size={20}
                    color={colors.primary}
                  />
                )}
                <TouchableOpacity
                  onPress={() => router.push(`/dua/${dua.id}`)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveDua(dua.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add More Button */}
          <TouchableOpacity
            style={[
              styles.addMoreButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={handleAddDuas}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.addMoreText, { color: colors.primary }]}>
              Daha Fazla Dua Ekle
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    flex: 1,
    textAlign: "center",
  },
  playlistHeader: {
    padding: 32,
    alignItems: "center",
  },
  playlistIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  playlistNameLarge: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  playlistDescLarge: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    textAlign: "center",
  },
  playlistCountLarge: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  playAllText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  duaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  duaInfo: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  duaArabic: {
    fontSize: 13,
  },
  duaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    marginTop: 8,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
