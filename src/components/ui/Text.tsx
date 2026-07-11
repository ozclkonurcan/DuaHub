import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/core/utils/cn";

type Variant = "display" | "title" | "heading" | "body" | "caption" | "label";

const variantClasses: Record<Variant, string> = {
  display: "text-4xl font-bold text-ink tracking-tight",
  title: "text-2xl font-bold text-ink",
  heading: "text-lg font-semibold text-ink",
  body: "text-base text-ink",
  caption: "text-sm text-muted",
  label: "text-xs font-semibold uppercase tracking-wider text-muted",
};

interface Props extends TextProps {
  variant?: Variant;
  className?: string;
}

export function Text({ variant = "body", className, ...rest }: Props) {
  return <RNText className={cn(variantClasses[variant], className)} {...rest} />;
}
