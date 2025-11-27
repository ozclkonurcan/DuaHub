import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");
const DEGREE_TO_RADIAN = Math.PI / 180;
const RADIAN_TO_DEGREE = 180 / Math.PI;

export default function QiblaScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassRotation] = useState(new Animated.Value(0));
  const [headingSubscription, setHeadingSubscription] =
    useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    requestLocationAndCalculate();
    startCompass();

    return () => {
      stopCompass();
    };
  }, []);

  const startCompass = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Pusula için konum izni gerekli');
        return;
      }

      const subscription = await Location.watchHeadingAsync((data) => {
        // Use trueHeading if available (requires GPS), otherwise magneticHeading
        const newHeading = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
        setHeading(newHeading);

        Animated.timing(compassRotation, {
          toValue: -newHeading,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });

      setHeadingSubscription(subscription);
    } catch (err) {
      console.error(err);
      // Fallback or error handling
    }
  };

  const stopCompass = () => {
    if (headingSubscription) {
      headingSubscription.remove();
      setHeadingSubscription(null);
    }
  };

  const requestLocationAndCalculate = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Konum izni reddedildi");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const direction = calculateQiblaDirection(latitude, longitude);
      setQiblaDirection(direction);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Konum alınamadı. Lütfen GPS'i açın.");
      setLoading(false);
    }
  };

  const calculateQiblaDirection = (lat: number, lng: number): number => {
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    const lat1 = lat * DEGREE_TO_RADIAN;
    const lat2 = kaabaLat * DEGREE_TO_RADIAN;
    const dLon = (kaabaLng - lng) * DEGREE_TO_RADIAN;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * RADIAN_TO_DEGREE;
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  const compassRotate = compassRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Difference between Qibla and Current Heading
  // 0 means pointing directly at Qibla
  const diff = Math.abs(heading - qiblaDirection);
  const isAligned = diff < 10 || diff > 350;

  if (loading) {
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
            Kıble Pusulası
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <Ionicons name="location" size={60} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Konum alınıyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
            Kıble Pusulası
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={requestLocationAndCalculate}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Kıble Pusulası
        </Text>
        <TouchableOpacity onPress={requestLocationAndCalculate}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Konum Bilgisi */}
      {userLocation && (
        <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
          </Text>
        </View>
      )}

      {/* Pusula */}
      <View style={styles.compassContainer}>
        {/* Dönen Pusula Çemberi */}
        <Animated.View
          style={[
            styles.compassCircle,
            {
              borderColor: colors.border,
              transform: [{ rotate: compassRotate }],
            },
          ]}
        >
          {/* Yön işaretleri */}
          <View style={[styles.directionMarker, { top: 10 }]}>
            <Text style={[styles.directionText, { color: colors.error }]}>
              K
            </Text>
          </View>
          <View style={[styles.directionMarker, { right: 10 }]}>
            <Text style={[styles.directionText, { color: colors.text }]}>
              D
            </Text>
          </View>
          <View style={[styles.directionMarker, { bottom: 10 }]}>
            <Text style={[styles.directionText, { color: colors.text }]}>
              G
            </Text>
          </View>
          <View style={[styles.directionMarker, { left: 10 }]}>
            <Text style={[styles.directionText, { color: colors.text }]}>
              B
            </Text>
          </View>

          {/* Kıble İbresi - Child of Rotating Container */}
          {/*
             Compass Circle is rotated by -heading.
             So 'top' of the circle points to North.
             We want the needle to point to Qibla (relative to North).
             So we just rotate it by qiblaDirection.
          */}
          <View
            style={[
              styles.needle,
              { transform: [{ rotate: `${qiblaDirection}deg` }] },
            ]}
          >
            <View style={styles.needleTop} />
            <View
              style={[styles.needleBottom, { backgroundColor: colors.error }]}
            />
          </View>

          {/* Merkez nokta */}
          <View
            style={[styles.centerDot, { backgroundColor: colors.primary }]}
          />
        </Animated.View>

        {/* Kabe ikonu */}
        <View style={[styles.kaabaIcon, { backgroundColor: colors.success }]}>
          <Text style={styles.kaabaText}>🕋</Text>
        </View>
      </View>

      {/* Derece Bilgisi */}
      <View style={[styles.degreeCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.degreeValue, { color: colors.primary }]}>
          {Math.round(heading)}°
        </Text>
        <Text style={[styles.degreeLabel, { color: colors.icon }]}>
          Pusula Yönü (Kuzey: 0°)
        </Text>
        <View style={styles.debugInfo}>
          <Text style={[styles.debugText, { color: colors.icon }]}>
            Kıble Açısı: {Math.round(qiblaDirection)}°
          </Text>
        </View>
      </View>

      {/* Bilgi Kutusu */}
      <View
        style={[styles.infoCard, { backgroundColor: colors.primary + "10" }]}
      >
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          Telefonunuzu düz tutun. Yeşil ok tam Kabe yönünü gösterir.
        </Text>
      </View>

      {/* Başarı Mesajı */}
      {isAligned ? (
        <View style={[styles.successCard, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.successText}>Kıbleye bakıyorsunuz! ✨</Text>
        </View>
      ) : null}
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
    paddingTop: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
  },
  compassContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  compassCircle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  directionMarker: {
    position: "absolute",
  },
  directionText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  needle: {
    position: "absolute",
    width: 8,
    height: width * 0.55,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  needleTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 40,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4ADE80",
  },
  needleBottom: {
    width: 6,
    height: width * 0.23,
    borderRadius: 3,
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
  },
  kaabaIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  kaabaText: {
    fontSize: 32,
  },
  degreeCard: {
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  degreeValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  degreeLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  debugInfo: {
    marginTop: 12,
    alignItems: "center",
  },
  debugText: {
    fontSize: 11,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
