import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Modal, TextInput, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";
import { Ionicons } from "@expo/vector-icons";

// Simple Helper for Hijri (Mock estimation based on offset)
// Real implementation should use 'hijri-converter' or similar library
const getHijriDateString = (date: Date) => {
    // Very rough approximation for demo:
    // 2025 roughly corresponds to 1446-1447
    // This is just a placeholder string generator
    const hijriMonths = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];
    const day = date.getDate();
    const month = date.getMonth(); // 0-11
    // Just a dummy static calc for visual proof of "Dynamic" intent
    return `${day} ${hijriMonths[month % 12]} 1447`;
};

export default function AgendaScreen() {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Mock Agenda Items - In real app, load from Storage/DB
  const [items, setItems] = useState([
      { time: "05:12", title: "İmsak", type: "prayer" },
      { time: "06:45", title: "Sabah Zikri", type: "task" },
      { time: "12:45", title: "Öğle Namazı", type: "prayer" },
      { time: "13:30", title: "Kuran Okuma (10. Cüz)", type: "task" },
      { time: "16:32", title: "İkindi Namazı", type: "prayer" },
  ]);

  useEffect(() => {
    // Update date on mount to ensure freshness
    setCurrentDate(new Date());
  }, []);

  const handleAddNote = () => {
      if (newNote.trim().length === 0) return;

      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const newItem = {
          time: timeString,
          title: newNote,
          type: 'task'
      };

      // Simple insert and sort by time
      const updated = [...items, newItem].sort((a, b) => a.time.localeCompare(b.time));
      setItems(updated);
      setNewNote("");
      setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        {/* Back Button with visible icon */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Günlük Ajanda</Text>

        {/* Add Button */}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Date Header */}
        <View style={styles.dateHeader}>
            <Text style={[styles.dateText, { color: colors.text }]}>
                {currentDate.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <Text style={[styles.hijriText, { color: colors.primary }]}>
                {getHijriDateString(currentDate)}
            </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
            {items.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                    <View style={styles.timeColumn}>
                        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
                    </View>
                    <View style={styles.lineCtx}>
                        <View style={[styles.dot, { backgroundColor: item.type === 'prayer' ? colors.primary : colors.secondary }]} />
                        {index < items.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
                    </View>
                    <ThemedCard style={[styles.itemCard, { flex: 1, marginBottom: 16 }]}>
                         <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                         <Text style={[styles.itemType, { color: colors.icon }]}>{item.type === 'prayer' ? 'Vakit' : 'Kişisel'}</Text>
                    </ThemedCard>
                </View>
            ))}
        </View>

      </ScrollView>

      {/* Add Note Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Not Ekle</Text>
                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Planınız nedir?"
                    placeholderTextColor={colors.icon}
                    value={newNote}
                    onChangeText={setNewNote}
                    autoFocus
                />
                <View style={styles.modalActions}>
                    <ThemedButton title="İptal" variant="ghost" onPress={() => setModalVisible(false)} />
                    <ThemedButton title="Ekle" onPress={handleAddNote} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
      padding: 8,
  },
  addButton: {
      padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  dateHeader: {
      alignItems: 'center',
      marginBottom: 24,
  },
  dateText: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  hijriText: {
      fontSize: 16,
      marginTop: 4,
  },
  timeline: {
      paddingLeft: 10,
  },
  timelineItem: {
      flexDirection: 'row',
      minHeight: 80,
  },
  timeColumn: {
      width: 60,
      paddingTop: 16,
  },
  timeText: {
      fontWeight: 'bold',
      fontSize: 14,
  },
  lineCtx: {
      alignItems: 'center',
      width: 20,
      marginRight: 10,
  },
  dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 20,
      zIndex: 1,
  },
  line: {
      width: 2,
      flex: 1,
      marginTop: -10, // Pull up to connect dots
  },
  itemCard: {
      justifyContent: 'center',
  },
  itemTitle: {
      fontSize: 16,
      fontWeight: '600',
  },
  itemType: {
      fontSize: 12,
      marginTop: 4,
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
      gap: 16,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },
  input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
  },
  modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
  }
});
