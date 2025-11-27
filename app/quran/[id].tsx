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

// Simple mock data for a few surahs to demonstrate functionality
const MOCK_QURAN_DATA: {[key: string]: { arabic: string; translation: string }[]} = {
  "1": [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Rahmân ve Rahîm olan Allah'ın adıyla." },
      { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "Hamd, Âlemlerin Rabbi olan Allah'a mahsustur." },
      { arabic: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "O, Rahmân ve Rahîm'dir." },
      { arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "Din gününün mâlikidir." },
      { arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "Yalnız sana ibadet ederiz ve yalnız senden yardım dileriz." },
      { arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Bizi doğru yola ilet." },
      { arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "Kendilerine nimet verdiklerinin yoluna; gazaba uğrayanların ve sapıkların yoluna değil." }
  ],
  "112": [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Rahmân ve Rahîm olan Allah'ın adıyla." },
      { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "De ki: O Allah birdir." },
      { arabic: "اللَّهُ الصَّمَدُ", translation: "Allah Samed'dir (Her şey O'na muhtaçtır, O hiçbir şeye muhtaç değildir)." },
      { arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "O doğurmamış ve doğmamıştır." },
      { arabic: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ", translation: "Ve O'nun hiçbir dengi yoktur." }
  ],
  "113": [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Rahmân ve Rahîm olan Allah'ın adıyla." },
      { arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "De ki: Sabahın Rabbine sığınırım." },
      { arabic: "مِنْ شَرِّ مَا خَلَقَ", translation: "Yarattığı şeylerin şerrinden," },
      { arabic: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "Karanlığı çöküp bastırdığında gecenin şerrinden," },
      { arabic: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "Düğümlere üfleyenlerin şerrinden," },
      { arabic: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "Ve hased ettiği zaman hasetçinin şerrinden." }
  ],
  "114": [
       { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Rahmân ve Rahîm olan Allah'ın adıyla." },
       { arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "De ki: İnsanların Rabbine sığınırım." },
       { arabic: "مَلِكِ النَّاسِ", translation: "İnsanların mâlikine," },
       { arabic: "إِلَٰهِ النَّاسِ", translation: "İnsanların ilâhına," },
       { arabic: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "Sinsice vesvese veren o vesvesecinin şerrinden," },
       { arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Ki o, insanların göğüslerine vesvese verir." },
       { arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "Gerek cinlerden gerek insanlardan." }
  ]
};

export default function QuranReaderScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [ayahs, setAyahs] = useState<{ arabic: string; translation: string }[]>([]);

  useEffect(() => {
    // In a real app, fetch from API or DB
    const data = MOCK_QURAN_DATA[id as string];
    if (data) {
        setAyahs(data);
    } else {
        // Fallback for demo if surah not in mock data
        setAyahs([
            { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "Rahmân ve Rahîm olan Allah'ın adıyla." },
            { arabic: "...", translation: "(Bu sure henüz yüklenmedi)" }
        ]);
    }
  }, [id]);

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
          Sure {id}
        </Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {ayahs.map((ayah, index) => (
            <View key={index} style={[styles.ayahContainer, { borderBottomColor: colors.border }]}>
                {index > 0 && ( // First index is usually Basmala which doesn't get a number in some views, but simple list for now
                     <View style={styles.ayahHeader}>
                         <View style={[styles.ayahNumber, { backgroundColor: colors.primary }]}>
                             <Text style={styles.ayahNumberText}>{index}</Text>
                         </View>
                     </View>
                )}
                <Text style={[styles.arabicText, { color: colors.text, fontSize: fontSize }]}>
                    {ayah.arabic}
                </Text>
                <Text style={[styles.translationText, { color: colors.text }]}>
                    {ayah.translation}
                </Text>
            </View>
        ))}
      </ScrollView>

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
  ayahContainer: {
      paddingVertical: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 12,
  },
  ayahHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
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
