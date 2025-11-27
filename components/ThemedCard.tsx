import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function ThemedCard({ style, variant = 'elevated', ...props }: ThemedCardProps) {
  const { colors, isDark } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: 'transparent',
        };
      case 'flat':
        return {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.card,
          shadowColor: isDark ? '#000' : '#888',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
});
