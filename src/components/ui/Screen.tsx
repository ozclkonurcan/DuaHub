import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/core/utils/cn";

interface Props {
  children: ReactNode;
  /** true ise içerik ScrollView içinde akar. */
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = false, className }: Props) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn("px-5 pb-10 pt-2", className)}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn("flex-1 px-5 pt-2", className)}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {content}
    </SafeAreaView>
  );
}
