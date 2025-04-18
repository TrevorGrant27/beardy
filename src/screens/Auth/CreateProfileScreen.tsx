import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import { colors, typography, spacing } from '../../theme'; // Import theme
import { StackScreenProps } from '@react-navigation/stack'; // Import StackScreenProps
import { OnboardingStackParamList } from '../../navigation/types'; // Import Onboarding params

// Define the props for the screen, including navigation
type Props = StackScreenProps<OnboardingStackParamList, 'CreateProfile'>;

const CreateProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const { user, createProfile, loadingProfile, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Username validation regex (3-30 chars, alphanumeric + underscore)
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

  const handleCreateProfile = async () => {
    setError(null); // Clear previous errors

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setError('Username must be 3-30 characters long and contain only letters, numbers, or underscores (_).');
      return;
    }

    // Call the createProfile function from context
    const { error: createError } = await createProfile(username.trim());

    if (createError) {
      setError(createError.message); // Display the error (e.g., "Username is already taken")
      Alert.alert('Profile Creation Failed', createError.message);
    } else {
      // Profile created successfully!
      // The AuthContext's profile state will update automatically because
      // createProfile fetches and sets the new profile data on success.
      // The AppNavigator should then automatically switch to the MainAppTabNavigator.
      console.log('Profile created successfully for user:', user?.id);
      // Navigate to the next step in the onboarding flow
      navigation.navigate('AddBeardieInfo');
    }
  };

  // Optional: Allow user to sign out if they get stuck here somehow
  const handleSignOut = async () => {
    await signOut();
    // Navigation will automatically switch back to AuthStack
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>
      <Text style={styles.subtitle}>Choose a unique username.</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.greyMedium} // Themed placeholder
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={30} // Max length based on regex/userflow
        editable={!loadingProfile}
      />

      <Text style={styles.requirements}>
        3-30 characters, letters, numbers, and underscores only.
      </Text>


      {loadingProfile ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} /> // Use theme color
      ) : (
        <Pressable 
          style={({ pressed }) => [styles.button, loadingProfile && styles.buttonDisabled, pressed && styles.buttonPressed]} 
          onPress={handleCreateProfile} 
          disabled={loadingProfile}
        >
           <Text style={[styles.buttonText, loadingProfile && styles.buttonTextDisabled]}>Complete Profile</Text>
        </Pressable>
      )}

      {/* Optional: Add a sign out button as a fallback */}
      {/* <Pressable style={styles.signOutButton} onPress={handleSignOut} disabled={loadingProfile}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.fonts.header,
    fontSize: typography.fontSizes.h2,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm, // Less space
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg, // More space before input
    textAlign: 'center',
  },
  input: {
    height: 45,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    marginBottom: spacing.xs, // Less space before requirements
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.body,
    color: colors.textPrimary,
  },
  requirements: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg, // More space before button
    textAlign: 'center',
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
  // signOutButton: { // Optional styles for sign out
  //   marginTop: spacing.md,
  // },
  // signOutButtonText: {
  //   fontFamily: typography.fonts.body,
  //   fontSize: typography.fontSizes.sm,
  //   color: colors.greyMedium,
  //   textAlign: 'center',
  // },
});

export default CreateProfileScreen; 