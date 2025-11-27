import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { ThemedButton } from "../components/ThemedButton";
import { ThemedCard } from "../components/ThemedCard";

export default function AgendaScreen() {
  const { colors } = useTheme();

  // Mock Agenda Items
  const items = [
      { time: "05:12", title: "İmsak", type: "prayer" },
      { time: "06:45", title: "Sabah Zikri", type: "task" },
      { time: "12:45", title: "Öğle Namazı", type: "prayer" },
      { time: "13:30", title: "Kuran Okuma (10. Cüz)", type: "task" },
      { time: "16:32", title: "İkindi Namazı", type: "prayer" },
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Günlük Ajanda</Text>
        <ThemedButton
            title=""
            icon="add"
            variant="ghost"
            onPress={() => {}}
            style={{ width: 40 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Date Header */}
        <View style={styles.dateHeader}>
            <Text style={[styles.dateText, { color: colors.text }]}>26 Haziran 2025</Text>
            <Text style={[styles.hijriText, { color: colors.primary }]}>1 Muharrem 1447</Text>
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
  }
});
