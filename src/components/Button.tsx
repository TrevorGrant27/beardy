import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme'; // Import our theme

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  style?: StyleProp<ViewStyle>; // Allow custom container styles
  textStyle?: StyleProp<TextStyle>; // Allow custom text styles
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  ...rest // Pass other TouchableOpacity props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton, // Apply disabled style
        style, // Apply custom container styles
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7} // Standard opacity feedback
      {...rest}
    >
      <Text
        style={[
          styles.text,
          disabled && styles.disabledText, // Apply disabled text style
          textStyle, // Apply custom text styles
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary, // Sunburst
    paddingVertical: theme.spacing.md, // 16
    paddingHorizontal: theme.spacing.lg, // 24
    borderRadius: 8, // Add rounded corners
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: theme.colors.white, // White text initially
    fontSize: theme.typography.fontSizes.button, // 16
    fontFamily: theme.typography.fonts.button, // Outfit-Regular
    fontWeight: theme.typography.fontWeights.medium, // Use medium weight for buttons
  },
  disabledButton: {
    backgroundColor: theme.colors.greyLight,
  },
  disabledText: {
    color: theme.colors.greyMedium,
  },
});

export default Button; 