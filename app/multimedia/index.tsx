import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedCard } from "../../components/ThemedCard";
import { Ionicons } from "@expo/vector-icons";

export default function MultimediaScreen() {
  const { colors } = useTheme();

  const categories = [
    { id: 'wallpapers', title: 'Duvar Kağıtları', icon: 'image', color: '#E53E3E' },
    { id: 'ringtones', title: 'Zil Sesleri', icon: 'musical-note', color: '#3182CE' },
    { id: 'cards', title: 'Tebrik Kartları', icon: 'card', color: '#38A169' },
  ];

  const featuredImages = [
      "https://images.unsplash.com/photo-1564121211835-e88c852648ab?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop"
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Multimedya</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Categories Grid */}
        <View style={styles.grid}>
            {categories.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryCard, { backgroundColor: colors.card }]}
                    // onPress={() => router.push(`/multimedia/${cat.id}`)} // Routes not implemented yet, just visual
                >
                    <View style={[styles.iconBox, { backgroundColor: cat.color + '20' }]}>
                        <Ionicons name={cat.icon as any} size={32} color={cat.color} />
                    </View>
                    <Text style={[styles.catTitle, { color: colors.text }]}>{cat.title}</Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Featured Wallpapers */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Öne Çıkanlar</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredImages.map((uri, idx) => (
                <TouchableOpacity key={idx} style={styles.imageCard}>
                    <Image source={{ uri }} style={styles.image} />
                </TouchableOpacity>
            ))}
             <TouchableOpacity style={[styles.imageCard, { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                 <Text style={{ color: colors.primary }}>Tümünü Gör</Text>
             </TouchableOpacity>
        </ScrollView>

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
  grid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
  },
  categoryCard: {
      flex: 1,
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
  },
  iconBox: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
  },
  catTitle: {
      fontWeight: '600',
      fontSize: 12,
      textAlign: 'center',
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: -12,
  },
  horizontalScroll: {
      flexGrow: 0,
  },
  imageCard: {
      width: 140,
      height: 220,
      borderRadius: 12,
      marginRight: 12,
      overflow: 'hidden',
  },
  image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  }
});
