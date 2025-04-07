import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../theme';

interface LoadingIndicatorProps extends ViewProps {
  size?: 'small' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large', // Default to large size
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Often used to center in a screen
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingIndicator; 