import { View, type ViewProps } from "react-native";

import { cn } from "@/core/utils/cn";

interface Props extends ViewProps {
  className?: string;
}

export function Card({ className, ...rest }: Props) {
  return (
    <View
      className={cn(
        "rounded-card border border-border bg-surface p-4",
        className,
      )}
      {...rest}
    />
  );
}
