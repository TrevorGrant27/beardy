import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing } from '../../theme';

// Define navigation prop type for this screen
type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ForgotPassword' // Add this route name to AuthStackParamList
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { requestPasswordReset, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false); // Track if request was sent

  const handlePasswordResetRequest = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    // Basic email format validation (optional but recommended)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }

    setError(null);
    setSubmitted(false);

    const { error: resetError } = await requestPasswordReset(email.trim());

    if (resetError) {
      // Generic error message for security - don't reveal if email exists
      setError('There was an issue sending the password reset email. Please try again.');
      Alert.alert('Error', 'Could not send password reset email.');
    } else {
      // Show success message regardless of whether the email exists
      setSubmitted(true);
      Alert.alert(
        'Check Your Email',
        'If an account exists for this email, a password reset link has been sent. Please also check your spam folder.'
      );
      // Optionally navigate back to Sign In after a delay, or let user press back
      // setTimeout(() => navigation.goBack(), 5000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {submitted ? (
          <Text style={styles.successText}>
            If an account exists for {email}, you will receive a password reset link shortly. Check your spam folder too!
          </Text>
      ) : (
        <>
          <Text style={styles.instructions}>
            Enter your email address below, and we'll send you a link to reset your password.
          </Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Your Email Address"
            placeholderTextColor={colors.greyMedium}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
          ) : (
            <Pressable
              style={({ pressed }) => [styles.button, loading && styles.buttonDisabled, pressed && styles.buttonPressed]}
              onPress={handlePasswordResetRequest}
              disabled={loading}
            >
              <Text style={[styles.buttonText, loading && styles.buttonTextDisabled]}>Send Reset Link</Text>
            </Pressable>
          )}
        </>
      )}

       {/* Back to Sign In Link Button */}
       <Pressable
         style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
         onPress={() => navigation.goBack()} // Go back to previous screen (SignIn)
         disabled={loading}
       >
         <Text style={styles.linkButtonText}>Back to Sign In</Text>
       </Pressable>
    </View>
  );
};

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
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    instructions: {
        fontFamily: typography.fonts.body,
        fontSize: typography.fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    successText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.fontSizes.md,
        color: colors.success, // Use success color
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: typography.fontWeights.medium,
    },
    input: {
        height: 45,
        backgroundColor: colors.white,
        borderColor: colors.greyLight,
        borderWidth: 1,
        marginBottom: spacing.lg, // More space before button
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        fontSize: typography.fontSizes.md,
        fontFamily: typography.fonts.body,
        color: colors.textPrimary,
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
        marginBottom: spacing.md,
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
    linkButton: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
        width: '100%',
        marginTop: spacing.sm,
    },
    linkButtonPressed: {
        opacity: 0.7,
    },
    linkButtonText: {
        fontFamily: typography.fonts.body,
        fontSize: typography.fontSizes.md,
        color: colors.primary,
        fontWeight: typography.fontWeights.medium,
        textDecorationLine: 'underline',
    },
});

export default ForgotPasswordScreen; 