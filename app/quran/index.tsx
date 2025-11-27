import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import i18n from "../../utils/i18n";

// Complete List of Surahs (1-114)
const SURAHS = [
  { id: 1, name: "Fâtiha", arabicName: "الفاتحة", verseCount: 7 },
  { id: 2, name: "Bakara", arabicName: "البقرة", verseCount: 286 },
  { id: 3, name: "Âl-i İmrân", arabicName: "آل عمران", verseCount: 200 },
  { id: 4, name: "Nisâ", arabicName: "النساء", verseCount: 176 },
  { id: 5, name: "Mâide", arabicName: "المائدة", verseCount: 120 },
  { id: 6, name: "En'âm", arabicName: "الأنعام", verseCount: 165 },
  { id: 7, name: "A'râf", arabicName: "الأعراف", verseCount: 206 },
  { id: 8, name: "Enfâl", arabicName: "الأنفال", verseCount: 75 },
  { id: 9, name: "Tevbe", arabicName: "التوبة", verseCount: 129 },
  { id: 10, name: "Yûnus", arabicName: "يونس", verseCount: 109 },
  { id: 11, name: "Hûd", arabicName: "هود", verseCount: 123 },
  { id: 12, name: "Yûsuf", arabicName: "يوسف", verseCount: 111 },
  { id: 13, name: "Ra'd", arabicName: "الرعد", verseCount: 43 },
  { id: 14, name: "İbrahim", arabicName: "ابراهيم", verseCount: 52 },
  { id: 15, name: "Hicr", arabicName: "الحجر", verseCount: 99 },
  { id: 16, name: "Nahl", arabicName: "النحل", verseCount: 128 },
  { id: 17, name: "İsrâ", arabicName: "الإسراء", verseCount: 111 },
  { id: 18, name: "Kehf", arabicName: "الكهف", verseCount: 110 },
  { id: 19, name: "Meryem", arabicName: "مريم", verseCount: 98 },
  { id: 20, name: "Tâhâ", arabicName: "طه", verseCount: 135 },
  { id: 21, name: "Enbiyâ", arabicName: "الأنبياء", verseCount: 112 },
  { id: 22, name: "Hac", arabicName: "الحج", verseCount: 78 },
  { id: 23, name: "Mü'minûn", arabicName: "المؤمنون", verseCount: 118 },
  { id: 24, name: "Nûr", arabicName: "النور", verseCount: 64 },
  { id: 25, name: "Furkân", arabicName: "الفرقان", verseCount: 77 },
  { id: 26, name: "Şu'arâ", arabicName: "الشعراء", verseCount: 227 },
  { id: 27, name: "Neml", arabicName: "النمل", verseCount: 93 },
  { id: 28, name: "Kasas", arabicName: "القصص", verseCount: 88 },
  { id: 29, name: "Ankebût", arabicName: "العنكبوت", verseCount: 69 },
  { id: 30, name: "Rûm", arabicName: "الروم", verseCount: 60 },
  { id: 31, name: "Lokmân", arabicName: "لقمان", verseCount: 34 },
  { id: 32, name: "Secde", arabicName: "السجدة", verseCount: 30 },
  { id: 33, name: "Ahzâb", arabicName: "الأحزاب", verseCount: 73 },
  { id: 34, name: "Sebe'", arabicName: "سبأ", verseCount: 54 },
  { id: 35, name: "Fâtır", arabicName: "فاطر", verseCount: 45 },
  { id: 36, name: "Yâsîn", arabicName: "يس", verseCount: 83 },
  { id: 37, name: "Sâffât", arabicName: "الصافات", verseCount: 182 },
  { id: 38, name: "Sâd", arabicName: "ص", verseCount: 88 },
  { id: 39, name: "Zümer", arabicName: "الزمر", verseCount: 75 },
  { id: 40, name: "Mü'min", arabicName: "غافر", verseCount: 85 },
  { id: 41, name: "Fussilet", arabicName: "فصلت", verseCount: 54 },
  { id: 42, name: "Şûrâ", arabicName: "الشورى", verseCount: 53 },
  { id: 43, name: "Zuhruf", arabicName: "الزخرف", verseCount: 89 },
  { id: 44, name: "Duhân", arabicName: "الدخان", verseCount: 59 },
  { id: 45, name: "Câsiye", arabicName: "الجاثية", verseCount: 37 },
  { id: 46, name: "Ahkâf", arabicName: "الأحقاف", verseCount: 35 },
  { id: 47, name: "Muhammed", arabicName: "محمد", verseCount: 38 },
  { id: 48, name: "Fetih", arabicName: "الفتح", verseCount: 29 },
  { id: 49, name: "Hucurât", arabicName: "الحجرات", verseCount: 18 },
  { id: 50, name: "Kâf", arabicName: "ق", verseCount: 45 },
  { id: 51, name: "Zâriyât", arabicName: "الذاريات", verseCount: 60 },
  { id: 52, name: "Tûr", arabicName: "الطور", verseCount: 49 },
  { id: 53, name: "Necm", arabicName: "النجم", verseCount: 62 },
  { id: 54, name: "Kamer", arabicName: "القمر", verseCount: 55 },
  { id: 55, name: "Rahmân", arabicName: "الرحمن", verseCount: 78 },
  { id: 56, name: "Vâkıa", arabicName: "الواقعة", verseCount: 96 },
  { id: 57, name: "Hadîd", arabicName: "الحديد", verseCount: 29 },
  { id: 58, name: "Mücâdele", arabicName: "المجادلة", verseCount: 22 },
  { id: 59, name: "Haşr", arabicName: "الحشر", verseCount: 24 },
  { id: 60, name: "Mümtehine", arabicName: "الممتحنة", verseCount: 13 },
  { id: 61, name: "Saff", arabicName: "الصف", verseCount: 14 },
  { id: 62, name: "Cuma", arabicName: "الجمعة", verseCount: 11 },
  { id: 63, name: "Münâfikûn", arabicName: "المنافقون", verseCount: 11 },
  { id: 64, name: "Teğâbün", arabicName: "التغابن", verseCount: 18 },
  { id: 65, name: "Talâk", arabicName: "الطلاق", verseCount: 12 },
  { id: 66, name: "Tahrîm", arabicName: "التحريم", verseCount: 12 },
  { id: 67, name: "Mülk", arabicName: "الملك", verseCount: 30 },
  { id: 68, name: "Kalem", arabicName: "القلم", verseCount: 52 },
  { id: 69, name: "Hâkka", arabicName: "الحاقة", verseCount: 52 },
  { id: 70, name: "Meâric", arabicName: "المعارج", verseCount: 44 },
  { id: 71, name: "Nûh", arabicName: "نوح", verseCount: 28 },
  { id: 72, name: "Cin", arabicName: "الجن", verseCount: 28 },
  { id: 73, name: "Müzzemmil", arabicName: "المزمل", verseCount: 20 },
  { id: 74, name: "Müddessir", arabicName: "المدثر", verseCount: 56 },
  { id: 75, name: "Kıyâme", arabicName: "القيامة", verseCount: 40 },
  { id: 76, name: "İnsân", arabicName: "الانسان", verseCount: 31 },
  { id: 77, name: "Mürselât", arabicName: "المرسلات", verseCount: 50 },
  { id: 78, name: "Nebe'", arabicName: "النبأ", verseCount: 40 },
  { id: 79, name: "Nâziât", arabicName: "النازعات", verseCount: 46 },
  { id: 80, name: "Abese", arabicName: "عبس", verseCount: 42 },
  { id: 81, name: "Tekvîr", arabicName: "التكوير", verseCount: 29 },
  { id: 82, name: "İnfitâr", arabicName: "الإنفطار", verseCount: 19 },
  { id: 83, name: "Mutaffifîn", arabicName: "المطففين", verseCount: 36 },
  { id: 84, name: "İnşikâk", arabicName: "الإنشقاق", verseCount: 25 },
  { id: 85, name: "Burûc", arabicName: "البروج", verseCount: 22 },
  { id: 86, name: "Târık", arabicName: "الطارق", verseCount: 17 },
  { id: 87, name: "A'lâ", arabicName: "الأعلى", verseCount: 19 },
  { id: 88, name: "Gâşiye", arabicName: "الغاشية", verseCount: 26 },
  { id: 89, name: "Fecr", arabicName: "الفجر", verseCount: 30 },
  { id: 90, name: "Beled", arabicName: "البلد", verseCount: 20 },
  { id: 91, name: "Şems", arabicName: "الشمس", verseCount: 15 },
  { id: 92, name: "Leyl", arabicName: "الليل", verseCount: 21 },
  { id: 93, name: "Duhâ", arabicName: "الضحى", verseCount: 11 },
  { id: 94, name: "İnşirâh", arabicName: "الشرح", verseCount: 8 },
  { id: 95, name: "Tîn", arabicName: "التين", verseCount: 8 },
  { id: 96, name: "Alak", arabicName: "العلق", verseCount: 19 },
  { id: 97, name: "Kadir", arabicName: "القدر", verseCount: 5 },
  { id: 98, name: "Beyyine", arabicName: "البينة", verseCount: 8 },
  { id: 99, name: "Zilzâl", arabicName: "الزلزلة", verseCount: 8 },
  { id: 100, name: "Âdiyât", arabicName: "العاديات", verseCount: 11 },
  { id: 101, name: "Kâria", arabicName: "القارعة", verseCount: 11 },
  { id: 102, name: "Tekâsür", arabicName: "التكاثر", verseCount: 8 },
  { id: 103, name: "Asr", arabicName: "العصر", verseCount: 3 },
  { id: 104, name: "Hümeze", arabicName: "الهمزة", verseCount: 9 },
  { id: 105, name: "Fîl", arabicName: "الفيل", verseCount: 5 },
  { id: 106, name: "Kureyş", arabicName: "قريش", verseCount: 4 },
  { id: 107, name: "Mâûn", arabicName: "الماعون", verseCount: 7 },
  { id: 108, name: "Kevser", arabicName: "الكوثر", verseCount: 3 },
  { id: 109, name: "Kâfirûn", arabicName: "الكافرون", verseCount: 6 },
  { id: 110, name: "Nasr", arabicName: "النصر", verseCount: 3 },
  { id: 111, name: "Tebbet", arabicName: "المسد", verseCount: 5 },
  { id: 112, name: "İhlâs", arabicName: "الإخلاص", verseCount: 4 },
  { id: 113, name: "Felak", arabicName: "الفلق", verseCount: 5 },
  { id: 114, name: "Nâs", arabicName: "الناس", verseCount: 6 },
];

export default function QuranIndexScreen() {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={() => router.push(`/quran/${item.id}`)}
    >
        <View style={styles.numberContainer}>
            <Text style={[styles.number, { color: colors.text }]}>{item.id}</Text>
        </View>
        <View style={styles.infoContainer}>
            <Text style={[styles.surahName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.verseCount, { color: colors.icon }]}>{item.verseCount} Ayet</Text>
        </View>
        <View style={styles.arabicContainer}>
             <Text style={[styles.arabicName, { color: colors.primary }]}>{item.arabicName}</Text>
        </View>
    </TouchableOpacity>
  );

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
          {i18n.t("quran")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={SURAHS}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
      paddingBottom: 20,
  },
  surahCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
  },
  numberContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  number: {
      fontSize: 14,
      fontWeight: 'bold',
  },
  infoContainer: {
      flex: 1,
  },
  surahName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
  },
  verseCount: {
      fontSize: 12,
  },
  arabicContainer: {
      alignItems: 'flex-end',
  },
  arabicName: {
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'System', // Or a specific Arabic font if loaded
  }
});
