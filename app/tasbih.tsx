import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Modal,
  FlatList,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";

interface ZikirLog {
    id: string;
    name: string;
    count: number;
    date: string;
}

export default function TasbihScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [history, setHistory] = useState<ZikirLog[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    loadTasbihState();
    loadHistory();
  }, []);

  useEffect(() => {
    saveTasbihState();
  }, [count, target, vibrationEnabled]);

  const loadTasbihState = async () => {
    try {
      const savedCount = await AsyncStorage.getItem("tasbih_count");
      const savedTarget = await AsyncStorage.getItem("tasbih_target");
      const savedVib = await AsyncStorage.getItem("tasbih_vib");

      if (savedCount) setCount(parseInt(savedCount, 10));
      if (savedTarget) setTarget(parseInt(savedTarget, 10));
      if (savedVib) setVibrationEnabled(savedVib === "true");
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
      try {
          const stored = await AsyncStorage.getItem("tasbih_history");
          if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
          console.error(e);
      }
  };

  const saveTasbihState = async () => {
    try {
      await AsyncStorage.setItem("tasbih_count", count.toString());
      await AsyncStorage.setItem("tasbih_target", target.toString());
      await AsyncStorage.setItem("tasbih_vib", vibrationEnabled.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);

    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (newCount % target === 0) {
      if (vibrationEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleReset = () => {
    Alert.alert("Sıfırla", "Sayacı sıfırlamak istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sıfırla",
        style: "destructive",
        onPress: () => {
          setCount(0);
          if (vibrationEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      },
    ]);
  };

  const cycleTarget = () => {
    const targets = [33, 99, 100, 500];
    const currentIndex = targets.indexOf(target);
    const nextTarget =
      currentIndex === -1 || currentIndex === targets.length - 1
        ? targets[0]
        : targets[currentIndex + 1];
    setTarget(nextTarget);
  };

  const handleSaveSession = async () => {
      if (count === 0) return;

      const newLog: ZikirLog = {
          id: Date.now().toString(),
          name: saveName || "Zikir",
          count: count,
          date: new Date().toLocaleDateString("tr-TR")
      };

      const updatedHistory = [newLog, ...history];
      setHistory(updatedHistory);
      await AsyncStorage.setItem("tasbih_history", JSON.stringify(updatedHistory));

      setSaveName("");
      setModalVisible(false);
      Alert.alert("Kaydedildi", "Zikir geçmişe eklendi.");
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
          Zikirmatik
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
             <Ionicons name="time" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Display */}
        <View style={[styles.displayContainer, { borderColor: colors.primary }]}>
          <Text style={[styles.countText, { color: colors.text }]}>
            {count}
          </Text>
          <Text style={[styles.targetText, { color: colors.icon }]}>
            Hedef: {target}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.card }]}
            onPress={cycleTarget}
          >
            <Ionicons name="flag-outline" size={20} color={colors.text} />
            <Text style={[styles.smallButtonText, { color: colors.text }]}>
              Hedef
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.card }]}
            onPress={() => setVibrationEnabled(!vibrationEnabled)}
          >
            <Ionicons
              name={vibrationEnabled ? "volume-high-outline" : "volume-mute-outline"}
              size={20}
              color={colors.text}
            />
            <Text style={[styles.smallButtonText, { color: colors.text }]}>
              {vibrationEnabled ? "Titreşim" : "Sessiz"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: colors.card }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="save-outline" size={20} color={colors.success} />
            <Text style={[styles.smallButtonText, { color: colors.success }]}>
              Kaydet
            </Text>
          </TouchableOpacity>
        </View>

        {/* Big Counter Button */}
        <TouchableOpacity
          style={[styles.counterButton, { backgroundColor: colors.primary }]}
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <Ionicons name="finger-print-outline" size={64} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* History/Save Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Zikir Geçmişi</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.saveSection}>
                    <Text style={[styles.label, { color: colors.text }]}>Mevcut Zikiri Kaydet</Text>
                    <View style={styles.saveRow}>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Zikir Adı (Örn: Subhanallah)"
                            placeholderTextColor={colors.icon}
                            value={saveName}
                            onChangeText={setSaveName}
                        />
                        <ThemedButton title="Kaydet" onPress={handleSaveSession} size="sm" />
                    </View>
                </View>

                <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Geçmiş Kayıtlar</Text>
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    style={{ maxHeight: 300 }}
                    renderItem={({ item }) => (
                        <View style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                            <View>
                                <Text style={[styles.historyName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.historyDate, { color: colors.icon }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.historyCount, { color: colors.primary }]}>{item.count}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: colors.icon, textAlign: 'center', padding: 20 }}>Henüz kayıt yok.</Text>}
                />
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
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  displayContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    borderWidth: 4,
    borderRadius: 200,
    aspectRatio: 1,
    maxWidth: 300,
    borderStyle: "dashed",
  },
  countText: {
    fontSize: 80,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  targetText: {
    fontSize: 18,
    marginTop: 10,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    justifyContent: "center",
  },
  smallButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    gap: 4,
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  counterButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
  },
  modalContent: {
      padding: 20,
      borderRadius: 16,
      maxHeight: '80%',
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
  saveSection: {
      gap: 8,
      marginBottom: 10,
  },
  label: {
      fontWeight: '600',
      fontSize: 14,
  },
  saveRow: {
      flexDirection: 'row',
      gap: 10,
  },
  input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
  },
  historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
  },
  historyName: {
      fontWeight: '600',
  },
  historyDate: {
      fontSize: 12,
  },
  historyCount: {
      fontWeight: 'bold',
      fontSize: 16,
  }
});
