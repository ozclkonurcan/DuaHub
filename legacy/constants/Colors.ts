// constants/Colors.ts
/**
 * DuaHub Renk Paleti
 * Yeşil tonları yerine modern, sakin bir mavi-mor gradient kullanıyoruz
 * Bu, rekabetten ayrışmamızı sağlar
 */

const tintColorLight = '#2563EB'; // Parlak mavi
const tintColorDark = '#818CF8';  // Açık mor-mavi

export const Colors = {
  light: {
    text: '#1F2937',           // Koyu gri (okunabilirlik)
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    card: '#F9FAFB',
    border: '#E5E7EB',
    primary: '#2563EB',        // Ana mavi
    secondary: '#7C3AED',      // Mor
    accent: '#F59E0B',         // Altın (premium için)
    success: '#10B981',
    error: '#EF4444',
    gradient: {
      start: '#2563EB',
      end: '#7C3AED',
    },
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    card: '#1F2937',
    border: '#374151',
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#FBBF24',
    success: '#34D399',
    error: '#F87171',
    gradient: {
      start: '#3B82F6',
      end: '#8B5CF6',
    },
  },
};

export default Colors;