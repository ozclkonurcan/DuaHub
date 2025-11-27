import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Hoş Geldiniz',
    desc: 'DuaHub ile ibadetlerinizi düzenleyin, takip edin ve huzur bulun.',
    icon: 'moon',
    color: '#1A5F7A'
  },
  {
    id: '2',
    title: 'Namaz Vakitleri & Kıble',
    desc: 'Konumunuza özel en doğru namaz vakitleri ve hassas kıble pusulası.',
    icon: 'compass',
    color: '#C5A059'
  },
  {
    id: '3',
    title: 'Kuran & Zikir',
    desc: 'Kuran-ı Kerim okuyun, hatim takibi yapın ve gelişmiş zikirmatik kullanın.',
    icon: 'book',
    color: '#38A169'
  },
  {
    id: '4',
    title: 'Topluluk & Paylaşım',
    desc: 'Dua kardeşliğine katılın, dualarınızı paylaşın ve başkalarına dua edin.',
    icon: 'people',
    color: '#805AD5'
  }
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: slides[currentIndex].color + '20' }]}>
            <Ionicons name={slides[currentIndex].icon as any} size={80} color={slides[currentIndex].color} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{slides[currentIndex].title}</Text>
        <Text style={[styles.desc, { color: colors.icon }]}>{slides[currentIndex].desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
            {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        { backgroundColor: index === currentIndex ? colors.primary : colors.border }
                    ]}
                />
            ))}
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleNext}>
            <Text style={styles.btnText}>
                {currentIndex === slides.length - 1 ? "Başla" : "İlerle"}
            </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
  },
  title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  desc: {
      fontSize: 16,
      textAlign: 'center',
      paddingHorizontal: 20,
      lineHeight: 24,
  },
  footer: {
      gap: 24,
  },
  pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
  },
  dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
  },
  btn: {
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
  },
  btnText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 18,
  }
});
