// app/playlists.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import * as PlaylistService from "../services/playlistService";

export default function PlaylistsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [])
  );

  const loadPlaylists = async () => {
    const lists = await PlaylistService.getPlaylists();
    setPlaylists(lists);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Hata", "Lütfen bir liste adı girin");
      return;
    }

    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await PlaylistService.createPlaylist(
      newPlaylistName,
      newPlaylistDesc || undefined,
      randomColor
    );

    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setShowCreateModal(false);
    loadPlaylists();
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    Alert.alert(
      "Listeyi Sil",
      `"${name}" listesini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await PlaylistService.deletePlaylist(id);
            loadPlaylists();
          },
        },
      ]
    );
  };
  const handleOpenPlaylist = (playlistId: string) => {
    router.push({
      pathname: "/playlist/[id]",
      params: { id: playlistId },
    });
  };
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
          Dinleme Listeleri
        </Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="musical-notes-outline"
            size={80}
            color={colors.icon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Henüz liste yok
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Dua listelerinizi oluşturun ve sesli olarak dinleyin
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>İlk Listeni Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={[styles.playlistCard, { backgroundColor: colors.card }]}
              onPress={() => handleOpenPlaylist(playlist.id)}
            >
              <View
                style={[
                  styles.playlistIcon,
                  { backgroundColor: playlist.color },
                ]}
              >
                <Ionicons name="musical-notes" size={28} color="#FFFFFF" />
              </View>

              <View style={styles.playlistInfo}>
                <Text style={[styles.playlistName, { color: colors.text }]}>
                  {playlist.name}
                </Text>
                {playlist.description && (
                  <Text
                    style={[styles.playlistDesc, { color: colors.icon }]}
                    numberOfLines={1}
                  >
                    {playlist.description}
                  </Text>
                )}
                <Text style={[styles.playlistCount, { color: colors.icon }]}>
                  {playlist.duaIds.length} dua
                </Text>
              </View>

              <View style={styles.playlistActions}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeletePlaylist(playlist.id, playlist.name);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                </TouchableOpacity>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.icon}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Yeni Liste Oluştur
            </Text>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder="Liste Adı"
              placeholderTextColor={colors.icon}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor={colors.icon}
              value={newPlaylistDesc}
              onChangeText={setNewPlaylistDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName("");
                  setNewPlaylistDesc("");
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleCreatePlaylist}
              >
                <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                  Oluştur
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  playlistCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  playlistIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  playlistDesc: {
    fontSize: 13,
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 12,
  },
  playlistActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
