import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types'; // Using relative path
import { useAuth } from '../../context/AuthContext'; // Using relative path
import { colors, typography, spacing } from '../../theme'; // Import theme

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth(); // Get the signIn function from context

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn({ email, password });

    if (signInError) {
      setError(signInError.message);
      // Provide more user-friendly errors based on common Supabase auth errors
      if (signInError.message.includes('Invalid login credentials')) {
         Alert.alert('Sign In Failed', 'Incorrect email or password. Please try again.');
      } else {
         Alert.alert('Sign In Failed', signInError.message); // Fallback for other errors
      }
    } else {
      // Sign In successful! The AuthProvider's onAuthStateChange listener
      // will automatically handle the session update. The AppNavigator
      // will then determine if the user needs profile creation or can proceed to the main app.
      console.log('Sign in successful.');
      // No explicit navigation needed here, navigator will react to auth state.
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

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

      {/* Password Input Container */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor={colors.greyMedium}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
          autoComplete="current-password"
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

      {/* Forgot Password Link */}
      <TouchableOpacity 
         onPress={() => navigation.navigate('ForgotPassword')}
         style={styles.forgotPasswordButton} 
         disabled={loading}
      >
         <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} /> 
      ) : (
        <Pressable 
          style={({ pressed }) => [styles.button, loading && styles.buttonDisabled, pressed && styles.buttonPressed]} 
          onPress={handleSignIn} 
          disabled={loading}
        >
          <Text style={[styles.buttonText, loading && styles.buttonTextDisabled]}>Sign In</Text>
        </Pressable>
      )}

       {/* Sign Up Link Button */}
       <Pressable 
         style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]} 
         onPress={() => navigation.navigate('SignUp')} 
         disabled={loading}
       >
         <Text style={styles.linkButtonText}>Don't have an account? Sign Up</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.xs, // Less space before forgot password link
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
   forgotPasswordButton: {
      alignSelf: 'flex-end',
      paddingVertical: spacing.sm, // Add padding for easier touch target
      marginBottom: spacing.lg, // More space before main button
  },
  forgotPasswordText: {
      color: colors.primary,
      fontSize: typography.fontSizes.sm,
      fontFamily: typography.fonts.body,
      textDecorationLine: 'underline',
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
      marginVertical: spacing.lg, // Consistent spacing around spinner
  },
  button: { // Main action button
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
  linkButton: { // Secondary action button (Sign Up link)
    paddingVertical: spacing.sm,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.sm, // Add some space above
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

export default SignInScreen; 