import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";

export default function LiveKaabaScreen() {
  const { colors } = useTheme();

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
          {i18n.t("liveKaaba")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.videoContainer}>
        <WebView
          style={styles.webview}
          source={{ uri: 'https://www.youtube.com/embed/live_stream?channel=UC4gK8W8r9K8g' }} // Placeholder for generic live stream logic or specific channel
          allowsFullscreenVideo
        />
      </View>

      <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.text }]}>
              Kabe'den 7/24 Canlı Yayın
          </Text>
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
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
      padding: 16,
      alignItems: 'center',
  },
  infoText: {
      fontSize: 16,
      fontWeight: '500',
  }
});
