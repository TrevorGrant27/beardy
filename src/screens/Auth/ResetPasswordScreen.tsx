import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, Pressable, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing } from '../../theme';

// Define navigation prop type
// Although often accessed via deep link, it might be part of a stack conceptually
type ResetPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ResetPassword' // Add this route name to AuthStackParamList
>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  // Potentially receive tokens/info from deep link via route params if needed,
  // but Supabase often handles session update automatically via URL fragment.
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const { updateUserPassword, loading, user } = useAuth(); // Use main loading state for now
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setError(null);

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // User should already be authenticated via the reset link at this point
    if (!user) {
      setError('Authentication error. Please sign in again or restart the reset process.');
      Alert.alert('Error', 'User session not found. Please try signing in.');
      // Optionally navigate to sign in: navigation.navigate('SignIn');
      return;
    }

    const { error: updateError } = await updateUserPassword(password);

    if (updateError) {
      setError(updateError.message);
      Alert.alert('Password Update Failed', updateError.message);
    } else {
      Alert.alert('Success', 'Your password has been updated successfully. Please sign in again.');
      // Password is updated, navigate user to Sign In screen
      // Ideally, signOut first if session persists, but Supabase might handle this.
      // For clarity, let's just navigate. The navigator should handle the rest.
      navigation.navigate('SignIn');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.instructions}>
        Enter your new password below. Make sure it's secure.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Password Input Container */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New Password (min. 8 characters)"
          placeholderTextColor={colors.greyMedium}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoComplete="new-password"
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          disabled={loading}
        >
          <Text style={styles.toggleButtonText}>
            {isPasswordVisible ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input Container */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm New Password"
          placeholderTextColor={colors.greyMedium}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!isConfirmPasswordVisible}
          autoCapitalize="none"
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          disabled={loading}
        >
          <Text style={styles.toggleButtonText}>
            {isConfirmPasswordVisible ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <Pressable
          style={({ pressed }) => [styles.button, loading && styles.buttonDisabled, pressed && styles.buttonPressed]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={[styles.buttonText, loading && styles.buttonTextDisabled]}>Set New Password</Text>
        </Pressable>
      )}
    </View>
  );
};

// Re-use styles similar to SignUp/SignIn, adjust where needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.fonts.header,
    fontSize: typography.fontSizes.h2,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  instructions: {
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.md,
    height: 45,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
  },
  toggleButton: {
    paddingHorizontal: spacing.sm,
    height: '100%',
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.body,
    fontWeight: typography.fontWeights.semiBold,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  },
  spinner: {
    marginVertical: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: spacing.sm, // Add some space above button
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: colors.greyLight,
  },
  buttonText: {
    fontFamily: typography.fonts.button,
    fontSize: typography.fontSizes.button,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  buttonTextDisabled: {
    color: colors.greyMedium,
  },
});

export default ResetPasswordScreen; 