import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { theme } from '../theme'; // Import our theme

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Allow custom container styles
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  ...rest // Pass other View props
}) => {
  return (
    <View
      style={[
        styles.card,
        style, // Apply custom container styles
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground, // White background
    borderRadius: 8,
    padding: theme.spacing.md, // Default padding
    // Add platform-specific shadow/elevation
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default Card; 