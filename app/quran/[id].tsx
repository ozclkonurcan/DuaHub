import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { Audio } from 'expo-av';

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [ayahs, setAyahs] = useState<{ number: number; text: string; translation?: string; audio?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [surahName, setSurahName] = useState(`Sure ${id}`);
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSurah();
    return () => {
        if (sound) {
            sound.unloadAsync();
        }
    };
  }, [id]);

  const fetchSurah = async () => {
      try {
          // Fetch Arabic Text + Audio (Alafasy) - Using HTTPS
          const arabicRes = await fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`);
          const arabicData = await arabicRes.json();

          // Fetch Translation (Turkish - Diyanet) - Using HTTPS
          const trRes = await fetch(`https://api.alquran.cloud/v1/surah/${id}/tr.diyanet`);
          const trData = await trRes.json();

          if (arabicData.code === 200 && trData.code === 200) {
              setSurahName(arabicData.data.englishName);

              const combined = arabicData.data.ayahs.map((ayah: any, index: number) => ({
                  number: ayah.numberInSurah,
                  text: ayah.text,
                  translation: trData.data.ayahs[index].text,
                  audio: ayah.audio
              }));
              setAyahs(combined);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const playAudio = async (uri: string) => {
      try {
          if (sound) {
              await sound.unloadAsync();
          }
          // Use secure URI if provided, otherwise trust API
          const { sound: newSound } = await Audio.Sound.createAsync({ uri });
          setSound(newSound);
          setIsPlaying(true);
          await newSound.playAsync();
          newSound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                  setIsPlaying(false);
              }
          });
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {surahName}
        </Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
          <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
            {ayahs.map((ayah, index) => (
                <View key={index} style={[styles.ayahContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.ayahHeader}>
                        <View style={[styles.ayahNumber, { backgroundColor: colors.primary }]}>
                            <Text style={styles.ayahNumberText}>{ayah.number}</Text>
                        </View>
                        <TouchableOpacity onPress={() => ayah.audio && playAudio(ayah.audio)}>
                            <Ionicons name="play-circle" size={32} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.arabicText, { color: colors.text, fontSize: fontSize }]}>
                        {ayah.text}
                    </Text>
                    <Text style={[styles.translationText, { color: colors.text }]}>
                        {ayah.translation}
                    </Text>
                </View>
            ))}
        </ScrollView>
      )}

      {/* Settings Modal */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={settingsVisible}
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Okuma Ayarları</Text>
                <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                  <Text style={{ color: colors.text }}>Yazı Boyutu</Text>
                  <View style={styles.sizeControls}>
                      <TouchableOpacity onPress={() => setFontSize(Math.max(18, fontSize - 2))} style={[styles.sizeBtn, { backgroundColor: colors.border }]}>
                          <Ionicons name="remove" size={20} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={{ color: colors.text, marginHorizontal: 10 }}>{fontSize}</Text>
                      <TouchableOpacity onPress={() => setFontSize(Math.min(40, fontSize + 2))} style={[styles.sizeBtn, { backgroundColor: colors.border }]}>
                          <Ionicons name="add" size={20} color={colors.text} />
                      </TouchableOpacity>
                  </View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
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
  content: {
    padding: 16,
  },
  center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  ayahContainer: {
      paddingVertical: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 12,
  },
  ayahHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
  },
  ayahNumber: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
  },
  ayahNumberText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  },
  arabicText: {
      textAlign: 'right',
      fontWeight: 'bold',
      lineHeight: 50,
  },
  translationText: {
      fontSize: 16,
      lineHeight: 24,
      fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
  },
  sizeControls: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  sizeBtn: {
      padding: 8,
      borderRadius: 8,
  }
});
