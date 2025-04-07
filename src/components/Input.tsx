import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  View,
  Text,
} from 'react-native';
import { theme } from '../theme'; // Import our theme

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  containerStyle,
  onFocus,
  onBlur,
  ...rest // Pass other TextInput props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused, // Apply focus style
          error ? styles.inputError : null, // Apply error style
          style, // Apply custom input styles
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderTextColor={theme.colors.greyMedium} // Use theme color for placeholder
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md, // Spacing below input
  },
  label: {
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
    borderRadius: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2, // Adjust vertical padding
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  inputFocused: {
    borderColor: theme.colors.primary, // Highlight with primary color on focus
    // You could add shadow or other effects on focus too
  },
  inputError: {
    borderColor: theme.colors.error, // Use error color for border
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fonts.body,
  },
});

export default Input; 