import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Location from 'expo-location';

export default function WeatherWidget() {
  const { colors } = useTheme();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // OpenMeteo API (Free, No Key)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );
      const data = await response.json();
      setWeather(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch');
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
      // WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
      if (code === 0) return "sunny";
      if (code <= 3) return "partly-sunny";
      if (code <= 48) return "cloudy";
      if (code <= 67) return "rainy";
      if (code <= 77) return "snow";
      if (code <= 82) return "rainy";
      if (code <= 99) return "thunderstorm";
      return "partly-sunny";
  };

  const getWeatherDesc = (code: number) => {
       if (code === 0) return "Açık";
       if (code <= 3) return "Parçalı Bulutlu";
       if (code <= 48) return "Sisli";
       if (code <= 67) return "Yağmurlu";
       if (code <= 77) return "Karlı";
       if (code <= 99) return "Fırtına";
       return "Bilinmiyor";
  };

  if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: colors.card, justifyContent: 'center' }]}>
             <ActivityIndicator color={colors.primary} />
        </View>
      );
  }

  if (error || !weather) {
      return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
             <Text style={{color: colors.text}}>Hava durumu alınamadı</Text>
        </View>
      );
  }

  const temp = Math.round(weather.current.temperature_2m);
  const code = weather.current.weather_code;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.left}>
        <Ionicons name={getWeatherIcon(code)} size={32} color={colors.primary} />
        <View>
             <Text style={[styles.temp, { color: colors.text }]}>{temp}°C</Text>
             <Text style={[styles.city, { color: colors.icon }]}>Konumunuz</Text>
        </View>
      </View>
      <View style={styles.right}>
          <Text style={[styles.desc, { color: colors.text }]}>{getWeatherDesc(code)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    minHeight: 80,
  },
  left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  temp: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  city: {
      fontSize: 12,
  },
  right: {
      alignItems: 'flex-end',
  },
  desc: {
      fontSize: 14,
      fontWeight: '500',
  }
});
