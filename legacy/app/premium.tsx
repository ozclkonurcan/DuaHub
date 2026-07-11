// app/premium.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import * as PurchaseService from "../services/purchaseService";

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setLoading(true);
    const offering = await PurchaseService.getOfferings();

    if (offering && offering.availablePackages) {
      setPackages(offering.availablePackages);
      // Varsayılan olarak ilk paketi seç
      if (offering.availablePackages.length > 0) {
        setSelectedPackage(offering.availablePackages[0]);
      }
    }

    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setPurchasing(true);

    const result = await PurchaseService.purchasePackage(selectedPackage);

    setPurchasing(false);

    if (result.success) {
      Alert.alert(
        "Başarılı! 🎉",
        "Premium üyeliğiniz aktif edildi. Tüm özelliklerin keyfini çıkarın!",
        [
          {
            text: "Tamam",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      if (result.error !== "Satın alma iptal edildi") {
        Alert.alert("Hata", result.error || "Satın alma başarısız oldu");
      }
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await PurchaseService.restorePurchases();
    setLoading(false);

    if (result.success) {
      if (result.isPremium) {
        Alert.alert("Başarılı! 🎉", "Premium üyeliğiniz geri yüklendi!", [
          {
            text: "Tamam",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Bilgi", "Geri yüklenecek satın alma bulunamadı.");
      }
    } else {
      Alert.alert("Hata", result.error || "Geri yükleme başarısız oldu");
    }
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackageTitle = (pkg: PurchasesPackage) => {
    switch (pkg.packageType) {
      case "MONTHLY":
        return "Aylık";
      case "ANNUAL":
        return "Yıllık";
      case "WEEKLY":
        return "Haftalık";
      default:
        return pkg.product.title;
    }
  };

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
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          style={styles.heroGradient}
        >
          <Ionicons name="star" size={60} color="#FFFFFF" />
          <Text style={styles.heroTitle}>Premium a Yükselt</Text>
          <Text style={styles.heroSubtitle}>Tüm özelliklerin kilidini aç</Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {[
            {
              icon: "close-circle",
              title: "Reklamsız Deneyim",
              desc: "Hiç reklam görmeden kullan",
            },
            {
              icon: "musical-notes",
              title: "Tüm Sesli Dualar",
              desc: "Premium sesli dua kayıtları",
            },
            {
              icon: "cloud-download",
              title: "Offline Dinleme",
              desc: "İnternetsiz erişim",
            },
            {
              icon: "notifications",
              title: "Özel Hatırlatmalar",
              desc: "Gelişmiş bildirimler",
            },
            {
              icon: "color-palette",
              title: "Özel Temalar",
              desc: "Renkli tema seçenekleri",
            },
            {
              icon: "shield-checkmark",
              title: "Öncelikli Destek",
              desc: "Hızlı yardım",
            },
          ].map((feature, index) => (
            <View
              key={index}
              style={[styles.featureItem, { backgroundColor: colors.card }]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, { color: colors.icon }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Paketler yükleniyor...
            </Text>
          </View>
        ) : packages.length > 0 ? (
          <View style={styles.pricingContainer}>
            <Text style={[styles.pricingTitle, { color: colors.text }]}>
              Planını Seç
            </Text>
            {packages.map((pkg, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.card },
                  selectedPackage?.identifier === pkg.identifier && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedPackage(pkg)}
              >
                <View style={styles.packageInfo}>
                  <Text style={[styles.packageTitle, { color: colors.text }]}>
                    {getPackageTitle(pkg)}
                  </Text>
                  <Text style={[styles.packageDesc, { color: colors.icon }]}>
                    {pkg.product.description}
                  </Text>
                </View>
                <View style={styles.packagePrice}>
                  <Text
                    style={[styles.packagePriceText, { color: colors.primary }]}
                  >
                    {formatPrice(pkg)}
                  </Text>
                  {selectedPackage?.identifier === pkg.identifier && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.text }]}>
              Paketler yüklenemedi. Lütfen tekrar deneyin.
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={loadOfferings}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={loading}
        >
          <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
            Satın Almaları Geri Yükle
          </Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.termsText, { color: colors.icon }]}>
          Satın alma işlemi ile kullanım koşullarını ve gizlilik politikasını
          kabul etmiş olursunuz.
        </Text>
      </ScrollView>

      {/* Bottom Button */}
      {!loading && selectedPackage && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { backgroundColor: colors.primary },
              purchasing && { opacity: 0.6 },
            ]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="star" size={24} color="#FFFFFF" />
                <Text style={styles.purchaseButtonText}>
                  Premium a Geç - {formatPrice(selectedPackage)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroGradient: {
    padding: 40,
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  pricingContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 14,
  },
  packagePrice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packagePriceText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  restoreButton: {
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 18,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  purchaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 18,
    borderRadius: 16,
  },
  purchaseButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
