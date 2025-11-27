import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import i18n from "../utils/i18n";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ThemedCard } from "../components/ThemedCard";

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user, signInGuest } = useAuth();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDua, setNewDua] = useState("");

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
      try {
          const q = query(collection(db, "community_duas"), orderBy("createdAt", "desc"), limit(20));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPrayers(data);
      } catch (e) {
          console.error(e);
          // Fallback static data if fetch fails (e.g. permission or offline)
      } finally {
          setLoading(false);
      }
  };

  const handlePostDua = async () => {
      if (!user) {
          Alert.alert("Giriş Yap", "Dua paylaşmak için misafir girişi yapmalısınız.", [
              { text: "İptal" },
              { text: "Giriş Yap", onPress: async () => {
                  await signInGuest();
                  Alert.alert("Hoşgeldiniz", "Şimdi duanızı paylaşabilirsiniz.");
              }}
          ]);
          return;
      }

      if (newDua.trim().length < 5) {
          Alert.alert("Uyarı", "Lütfen en az 5 karakterlik bir dua yazın.");
          return;
      }

      try {
          await addDoc(collection(db, "community_duas"), {
              text: newDua,
              userId: user.uid,
              createdAt: new Date().toISOString(),
              likes: 0
          });
          setNewDua("");
          fetchPrayers(); // Refresh
          Alert.alert("Başarılı", "Duanız paylaşıldı.");
      } catch (e) {
          Alert.alert("Hata", "Dua paylaşılamadı.");
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
          {i18n.t("community")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Post Area */}
        <ThemedCard style={styles.postCard}>
            <Text style={[styles.label, { color: colors.text }]}>Bir Dua Paylaş</Text>
            <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Dua isteğinizi yazın..."
                placeholderTextColor={colors.icon}
                value={newDua}
                onChangeText={setNewDua}
                multiline
            />
            <TouchableOpacity style={[styles.postBtn, { backgroundColor: colors.primary }]} onPress={handlePostDua}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Paylaş</Text>
            </TouchableOpacity>
        </ThemedCard>

        {/* List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Dualar</Text>

        {loading ? (
            <ActivityIndicator color={colors.primary} />
        ) : (
            prayers.map((item) => (
                <ThemedCard key={item.id} style={styles.duaCard}>
                    <View style={styles.duaHeader}>
                        <Ionicons name="person-circle" size={32} color={colors.icon} />
                        <Text style={[styles.dateText, { color: colors.icon }]}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={[styles.duaText, { color: colors.text }]}>{item.text}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="heart-outline" size={20} color={colors.primary} />
                            <Text style={{ color: colors.primary }}>Amin De</Text>
                        </TouchableOpacity>
                    </View>
                </ThemedCard>
            ))
        )}

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
  postCard: {
      gap: 12,
  },
  label: {
      fontWeight: '600',
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      minHeight: 80,
      textAlignVertical: 'top',
  },
  postBtn: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
  },
  duaCard: {
      gap: 10,
  },
  duaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  dateText: {
      fontSize: 12,
  },
  duaText: {
      fontSize: 16,
      lineHeight: 24,
  },
  actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
  },
  actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
  }
});
