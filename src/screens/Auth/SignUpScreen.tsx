import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Linking, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types'; // Using relative path
import { useAuth } from '../../context/AuthContext'; // Using relative path
import { colors, typography, spacing } from '../../theme'; // Import theme

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth(); // Get the signUp function from context
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/; // Keep regex if needed elsewhere, or move validation

  const handleSignUp = async () => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
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
    if (!agreedToTerms) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      Alert.alert('Sign Up Failed', signUpError.message);
    } else {
      console.log('Sign up auth successful. Awaiting profile creation step.');
    }

    setLoading(false);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.greyMedium}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!loading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password (min. 8 characters)"
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

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
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

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={[styles.checkboxBase, agreedToTerms && styles.checkboxChecked, loading && styles.disabledCheckbox]}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          disabled={loading}
        >
          {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.link} onPress={() => openLink('https://example.com/terms')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.link} onPress={() => openLink('https://example.com/privacy')}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      ) : (
        <Pressable 
          style={({ pressed }) => [styles.button, (loading || !agreedToTerms) && styles.buttonDisabled, pressed && styles.buttonPressed]}
          onPress={handleSignUp} 
          disabled={loading || !agreedToTerms}
        >
          <Text style={[styles.buttonText, (loading || !agreedToTerms) && styles.buttonTextDisabled]}>Sign Up</Text>
        </Pressable>
      )}

      <Pressable 
        style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]} 
        onPress={() => navigation.navigate('SignIn')} 
        disabled={loading}
      >
        <Text style={styles.linkButtonText}>Already have an account? Sign In</Text>
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
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    height: 45,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    marginBottom: spacing.md,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.greyMedium,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledCheckbox: {
    backgroundColor: colors.greyLight,
    borderColor: colors.greyMedium,
  },
  checkmark: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    lineHeight: typography.fontSizes.sm * 1.4,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: typography.fontWeights.medium,
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
  spinner: {
    marginVertical: spacing.md,
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

export default SignUpScreen; 