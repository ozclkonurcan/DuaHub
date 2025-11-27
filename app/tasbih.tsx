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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TasbihScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTasbihState();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveTasbihState();
    }
  }, [count, target, vibrationEnabled, isLoaded]);

  const loadTasbihState = async () => {
    try {
      const savedCount = await AsyncStorage.getItem("tasbih_count");
      const savedTarget = await AsyncStorage.getItem("tasbih_target");
      const savedVib = await AsyncStorage.getItem("tasbih_vib");

      if (savedCount) setCount(parseInt(savedCount, 10));
      if (savedTarget) setTarget(parseInt(savedTarget, 10));
      if (savedVib) setVibrationEnabled(savedVib === "true");
    } catch (e) {
      console.error("Failed to load tasbih state", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveTasbihState = async () => {
    try {
      await AsyncStorage.setItem("tasbih_count", count.toString());
      await AsyncStorage.setItem("tasbih_target", target.toString());
      await AsyncStorage.setItem("tasbih_vib", vibrationEnabled.toString());
    } catch (e) {
      console.error("Failed to save tasbih state", e);
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
        <View style={{ width: 40 }} />
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
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.error} />
            <Text style={[styles.smallButtonText, { color: colors.error }]}>
              Sıfırla
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
});
