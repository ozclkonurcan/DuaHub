import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";

export default function CommunityScreen() {
  const { colors } = useTheme();

  const handleJoin = (feature: string) => {
      Alert.alert(
          "Giriş Gerekli",
          `"${feature}" özelliğini kullanmak için lütfen giriş yapın. (Bu özellik yakında aktif olacaktır)`,
          [{ text: "Tamam" }]
      );
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
          {i18n.t("community")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Dua Kardeşliği */}
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => handleJoin("Dua Kardeşliği")}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="people" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Dua Kardeşliği</Text>
                <Text style={[styles.cardDesc, { color: colors.icon }]}>
                    Birbirine dua eden binlerce kişiye katılın. Dua isteyin veya dua edin.
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>

        {/* Online Hatim */}
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => handleJoin("Online Hatim")}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="book" size={32} color={colors.success} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Online Hatim</Text>
                <Text style={[styles.cardDesc, { color: colors.icon }]}>
                    Toplu hatimlere katılın, cüz veya sayfa alarak sevaba ortak olun.
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>

        {/* Online Zikir */}
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => handleJoin("Online Zikir")}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name="finger-print" size={32} color={colors.accent} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Zikir Dünyası</Text>
                <Text style={[styles.cardDesc, { color: colors.icon }]}>
                    Canlı zikir halkalarına katılın.
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.icon} />
        </TouchableOpacity>

      </ScrollView>
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
    gap: 16,
  },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      gap: 16,
  },
  iconBox: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
  },
  cardContent: {
      flex: 1,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  cardDesc: {
      fontSize: 13,
      lineHeight: 18,
  }
});
