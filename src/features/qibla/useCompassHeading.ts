import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

interface CompassState {
  /** Derece (0-360, kuzeyden saat yönü); null = pusula verisi yok (web / izin yok). */
  heading: number | null;
  /** 0-3 arası sensör doğruluğu; düşükse kalibrasyon önerilir. */
  accuracy: number | null;
}

/**
 * Canlı pusula yönü. watchHeadingAsync iOS'ta gerçek kuzeyi, Android'de
 * manyetik kuzeyi verir — kıble kullanım senaryosu için yeterli hassasiyettedir.
 * Web'de ve izin yokken heading=null döner; ekran statik açı moduna düşer.
 */
export function useCompassHeading(): CompassState {
  const [state, setState] = useState<CompassState>({
    heading: null,
    accuracy: null,
  });

  useEffect(() => {
    if (Platform.OS === "web") return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted || cancelled) return;
      subscription = await Location.watchHeadingAsync((data) => {
        const heading =
          data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
        setState({ heading, accuracy: data.accuracy });
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return state;
}
