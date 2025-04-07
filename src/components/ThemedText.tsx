import React from 'react';
import { Text, StyleSheet, TextProps, StyleProp, TextStyle } from 'react-native';
import { theme } from '../theme'; // Import our theme

// Define potential variants or roles for text
type TextVariant = 'body' | 'header' | 'button' | 'label' | 'caption' | 'error';
type FontWeightName = keyof typeof theme.typography.fontWeights;

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: TextVariant; // e.g., 'header', 'body', 'caption'
  weight?: FontWeightName; // e.g., 'normal', 'bold'
  color?: keyof typeof theme.colors; // Allow specifying theme color by name
  size?: keyof typeof theme.typography.fontSizes; // Allow specifying theme font size by name
}

const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  variant = 'body', // Default to body style
  weight,
  color,
  size,
  ...rest // Pass other Text props
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'header':
        return styles.header;
      case 'button':
        return styles.button;
      case 'label':
        return styles.label;
      case 'caption':
        return styles.caption;
      case 'error':
        return styles.error;
      case 'body':
      default:
        return styles.body;
    }
  };

  const customStyle: TextStyle = {};
  if (weight) {
    customStyle.fontWeight = theme.typography.fontWeights[weight];
  }
  if (color) {
    customStyle.color = theme.colors[color];
  }
  if (size) {
    customStyle.fontSize = theme.typography.fontSizes[size];
  }

  return (
    <Text
      style={[
        styles.base,
        getVariantStyle(),
        customStyle, // Apply specific overrides
        style, // Apply custom styles passed via props
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

// Define base and variant styles using the theme
const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary, // Default color
    fontFamily: theme.typography.fonts.body, // Default font
    fontSize: theme.typography.fontSizes.md, // Default size
  },
  body: {
    // Base styles are already body styles
  },
  header: {
    fontFamily: theme.typography.fonts.header,
    fontSize: theme.typography.fontSizes.h2, // Default header size (h2)
    fontWeight: theme.typography.fontWeights.semiBold,
  },
  button: {
    fontFamily: theme.typography.fonts.button,
    fontSize: theme.typography.fontSizes.button,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.white, // Button text is often white by default
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary, // Labels often use secondary text color
  },
  caption: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  error: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.error,
    fontFamily: theme.typography.fonts.body, // Ensure error text uses body font
  },
});

export default ThemedText; 