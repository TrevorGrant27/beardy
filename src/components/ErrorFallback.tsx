import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import Button from './Button';
import { theme } from '../theme';
import * as Updates from 'expo-updates';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void; // Function provided by ErrorBoundary to reset state
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleRestart = () => {
    // Attempt to reset the error boundary state first
    resetError();
    // Then, trigger an app reload
    Updates.reloadAsync();
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="header" style={styles.title}>
        Oops! Something went wrong.
      </ThemedText>
      <ThemedText style={styles.message}>
        We're sorry, an unexpected error occurred.
      </ThemedText>
      {__DEV__ && (
        <ThemedText variant="caption" style={styles.errorDetails}>
          Error: {error.message}
        </ThemedText>
      )}
      <Button title="Try Again / Restart App" onPress={handleRestart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    color: theme.colors.error, // Use error color for title
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  errorDetails: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default ErrorFallback; 