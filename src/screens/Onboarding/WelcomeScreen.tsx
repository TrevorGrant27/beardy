import React from 'react';
import { View, Text, StyleSheet, Button, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types'; // Reverted path
import { colors, typography, spacing } from '../../theme'; // Import theme

// Define navigation prop type for this screen
type WelcomeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'Welcome' // Route name for this screen in the navigator
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const goToOnboarding = () => {
    navigation.navigate('HighlightFeed'); // Navigate to first highlight screen
  };
  
  const goToSignIn = () => {
    navigation.navigate('SignIn'); // Navigate directly to SignIn
  };

  return (
    <View style={styles.container}>
      {/* TODO: Add App Logo / Image */}
      <Text style={styles.title}>Welcome to Beardy!</Text>
      <Text style={styles.subtitle}>Your bearded dragon companion app.</Text>
      {/* Add nice visuals or illustrations later */}
      <Pressable style={styles.button} onPress={goToOnboarding}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      {/* Sign In Link */}
      <Pressable onPress={goToSignIn} style={styles.signInLink}>
        <Text style={styles.signInLinkText}>Already have an account? Sign In</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg, // Use theme spacing
    backgroundColor: colors.background, // Use theme background
  },
  title: {
    fontFamily: typography.fonts.header, // Use header font
    fontSize: typography.fontSizes.h1, // Use h1 size
    color: colors.textPrimary, // Use primary text color
    fontWeight: typography.fontWeights.bold, // Specify weight if font requires it or for emphasis
    marginBottom: spacing.md, // Use theme spacing
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fonts.body, // Use body font
    fontSize: typography.fontSizes.lg, // Use large size
    color: colors.textSecondary, // Use secondary text color
    textAlign: 'center',
    marginBottom: spacing.xl * 2, // Use theme spacing (more space before button)
  },
  button: { // Style for Pressable acting as button
    backgroundColor: colors.primary, // Theme primary color
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '60%', // Ensure button has decent width
    marginBottom: spacing.md, // Add margin below Get Started button
  },
  buttonText: {
    fontFamily: typography.fonts.button, // Use button font
    fontSize: typography.fontSizes.button, // Use button font size
    color: colors.white, // White text on primary background
    fontWeight: typography.fontWeights.semiBold, // Make button text bolder
  },
  signInLink: { // Style for the Sign In link
    marginTop: spacing.sm, // Space between button and link
    padding: spacing.sm, // Add padding for easier tap target
  },
  signInLinkText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.md,
    color: colors.primary, // Use theme primary color
    fontWeight: typography.fontWeights.medium,
    textDecorationLine: 'underline',
  },
  // signInLink: { // Example styles for a secondary link
  //   marginTop: spacing.lg,
  // },
  // signInLinkText: {
  //   fontFamily: typography.fonts.body,
  //   fontSize: typography.fontSizes.md,
  //   color: colors.primary, // Use primary color for link
  //   textDecorationLine: 'underline',
  // },
});

export default WelcomeScreen; 