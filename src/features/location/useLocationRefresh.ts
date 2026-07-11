import * as Location from "expo-location";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

import { useLocationStore } from "@/stores/locationStore";

interface RefreshOptions {
  /** true ise izin yoksa kullanıcıdan ister; false ise sessizce vazgeçer. */
  request: boolean;
}

/**
 * GPS konumunu alıp store'a yazar; şehir/ilçe etiketini reverse geocode ile çözer.
 * Başarısızlıkta store'a dokunmaz — uygulama varsayılan/eski konumla çalışmaya devam eder.
 */
export function useLocationRefresh() {
  const setGpsLocation = useLocationStore((s) => s.setGpsLocation);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    async ({ request }: RefreshOptions): Promise<boolean> => {
      if (Platform.OS === "web") return false;
      setBusy(true);
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted && request) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!permission.granted) return false;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let label = "Konumum";
        try {
          const [place] = await Location.reverseGeocodeAsync(position.coords);
          label =
            place?.district ??
            place?.subregion ??
            place?.city ??
            place?.region ??
            label;
        } catch {
          // Geocode başarısızsa jenerik etiketle devam — vakit hesabı koordinatla çalışır.
        }

        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label,
        });
        return true;
      } catch {
        return false;
      } finally {
        setBusy(false);
      }
    },
    [setGpsLocation],
  );

  return { refresh, busy };
}
