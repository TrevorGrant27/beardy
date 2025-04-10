import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, spacing } from '../../theme';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'JoinPrompt'>;

interface JoinPromptScreenProps {
  navigation: ScreenNavigationProp;
}

const JoinPromptScreen: React.FC<JoinPromptScreenProps> = ({ navigation }) => {
  const goToSignUp = () => navigation.navigate('SignUp');
  const goToSignIn = () => navigation.navigate('SignIn');
  const goBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
       {/* Illustration/Icon Area (Optional) */}
       <View style={styles.iconArea}>
           {/* <MaterialCommunityIcons name="account-plus-outline" size={80} color={colors.primary} /> */}
           <Text style={styles.placeholderText}>[Icon/Illustration]</Text>
       </View>

      <Text style={styles.heading}>Join Beardy</Text>
      <Text style={styles.description}>
        Create an account or sign in to unlock all features and connect with the community!
      </Text>

      <Text style={styles.progressText}>5 / 5</Text>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.signUpButton, pressed && styles.buttonPressed]}
          onPress={goToSignUp}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, styles.signInButton, pressed && styles.buttonPressed]}
          onPress={goToSignIn}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>

      {/* Back Navigation (Optional) - Or rely on swipe */}
      {/* <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Previous</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },
  iconArea: {
      marginBottom: spacing.xl,
      // Add size/styling if using an icon
      width: 100, height: 100, borderRadius: 50, backgroundColor: colors.greyLight,
      justifyContent: 'center', alignItems: 'center',
  },
  placeholderText: {
      color: colors.greyMedium,
      fontFamily: typography.fonts.body,
  },
  heading: {
    fontFamily: typography.fonts.header,
    fontSize: typography.fontSizes.h2,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
   progressText: {
     fontFamily: typography.fonts.body,
     fontSize: typography.fontSizes.sm,
     color: colors.greyMedium,
     marginBottom: spacing.xl, // More space before buttons
   },
  buttonContainer: {
      width: '80%', // Constrain button width
      alignItems: 'center',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: '100%', // Make buttons fill container
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  signUpButton: {
      backgroundColor: colors.primary,
  },
  signInButton: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  signUpButtonText: {
     fontFamily: typography.fonts.button,
     fontSize: typography.fontSizes.button,
     fontWeight: typography.fontWeights.bold,
     color: colors.white,
  },
  signInButtonText: {
     fontFamily: typography.fonts.button,
     fontSize: typography.fontSizes.button,
     fontWeight: typography.fontWeights.bold,
     color: colors.primary,
  },
//   backButton: { marginTop: spacing.lg },
//   backButtonText: { color: colors.greyMedium, fontFamily: typography.fonts.body },
});

export default JoinPromptScreen; 