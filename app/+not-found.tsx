import { Link } from "expo-router";

import { Screen, Text } from "@/components/ui";

export default function NotFoundScreen() {
  return (
    <Screen className="items-center justify-center">
      <Text variant="title">Sayfa bulunamadı</Text>
      <Link href="/" className="mt-4">
        <Text className="font-semibold text-primary">Ana ekrana dön</Text>
      </Link>
    </Screen>
  );
}
