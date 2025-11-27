import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ProgressBarAndroid, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function KhatamScreen() {
  const { colors } = useTheme();
  const [juzStatus, setJuzStatus] = useState<boolean[]>(new Array(30).fill(false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    saveProgress();
  }, [juzStatus]);

  const loadProgress = async () => {
      try {
          const stored = await AsyncStorage.getItem("khatam_progress");
          if (stored) {
              const parsed = JSON.parse(stored);
              setJuzStatus(parsed);
              calculateProgress(parsed);
          }
      } catch (e) { console.error(e); }
  };

  const saveProgress = async () => {
      try {
          await AsyncStorage.setItem("khatam_progress", JSON.stringify(juzStatus));
          calculateProgress(juzStatus);
      } catch (e) { console.error(e); }
  };

  const calculateProgress = (status: boolean[]) => {
      const completed = status.filter(Boolean).length;
      setProgress(completed / 30);
  };

  const toggleJuz = (index: number) => {
      const newStatus = [...juzStatus];
      newStatus[index] = !newStatus[index];
      setJuzStatus(newStatus);
  };

  const handleReset = () => {
      Alert.alert("Sıfırla", "Hatim takibini sıfırlamak istiyor musunuz?", [
          { text: "İptal", style: 'cancel' },
          { text: "Evet", onPress: () => setJuzStatus(new Array(30).fill(false)) }
      ]);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hatim Takibi</Text>
        <ThemedButton
            title=""
            icon="refresh"
            variant="ghost"
            onPress={handleReset}
            style={{ width: 40 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Overall Progress */}
        <ThemedCard style={styles.progressCard}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Genel İlerleme</Text>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: colors.success }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.icon }]}>
                {Math.round(progress * 100)}% Tamamlandı ({juzStatus.filter(Boolean).length}/30 Cüz)
            </Text>
        </ThemedCard>

        {/* Grid of Juz */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cüzler</Text>
        <View style={styles.grid}>
            {juzStatus.map((isRead, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.juzBox,
                        {
                            backgroundColor: isRead ? colors.success : colors.card,
                            borderColor: isRead ? colors.success : colors.border
                        }
                    ]}
                    onPress={() => toggleJuz(index)}
                >
                    <Text style={[styles.juzText, { color: isRead ? '#FFF' : colors.text }]}>
                        {index + 1}
                    </Text>
                    {isRead && <Ionicons name="checkmark" size={12} color="#FFF" style={styles.checkIcon} />}
                </TouchableOpacity>
            ))}
        </View>

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
    gap: 24,
  },
  progressCard: {
      alignItems: 'center',
      gap: 12,
  },
  progressTitle: {
      fontWeight: '600',
      fontSize: 16,
  },
  progressBarBg: {
      width: '100%',
      height: 12,
      backgroundColor: '#E2E8F0',
      borderRadius: 6,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      borderRadius: 6,
  },
  progressText: {
      fontSize: 14,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: -12,
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between', // Try to space evenly
  },
  juzBox: {
      width: '18%', // Roughly 5 per row
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
  },
  juzText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  checkIcon: {
      position: 'absolute',
      top: 4,
      right: 4,
  }
});
