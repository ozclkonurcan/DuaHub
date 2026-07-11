import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/core/utils/cn";
import { Text } from "./Text";

type Variant = "primary" | "ghost";

interface Props extends Omit<PressableProps, "children"> {
  title: string;
  variant?: Variant;
  className?: string;
}

export function Button({
  title,
  variant = "primary",
  className,
  ...rest
}: Props) {
  return (
    <Pressable
      className={cn(
        "items-center justify-center rounded-2xl px-5 py-3.5 active:opacity-80",
        variant === "primary" && "bg-primary",
        variant === "ghost" && "border border-border bg-transparent",
        className,
      )}
      {...rest}
    >
      <Text
        className={cn(
          "text-base font-semibold",
          variant === "primary" ? "text-on-primary" : "text-ink",
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}
