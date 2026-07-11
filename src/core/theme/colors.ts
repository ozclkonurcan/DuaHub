/**
 * global.css'teki CSS değişkenlerinin JS karşılığı.
 * Navigasyon teması ve ikon renkleri gibi className alamayan yerlerde kullanılır.
 * Renk değişikliği yaparken iki dosyayı birlikte güncelle.
 */
export const palette = {
  light: {
    background: "#F6F8FB",
    surface: "#FFFFFF",
    raised: "#F1F5F9",
    border: "#E2E8F0",
    primary: "#0D9467",
    onPrimary: "#FFFFFF",
    gold: "#A47818",
    ink: "#0F172A",
    muted: "#64748B",
  },
  dark: {
    background: "#0A101C",
    surface: "#121A2A",
    raised: "#1A253A",
    border: "#243149",
    primary: "#20C58F",
    onPrimary: "#061812",
    gold: "#E3B341",
    ink: "#F1F5F9",
    muted: "#8C9EB8",
  },
} as const;

export type ThemeColors = {
  [K in keyof (typeof palette)["light"]]: string;
};
