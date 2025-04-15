import React from 'react';
import {
  View,
  StyleSheet,
  Image, // Keep Image if using logo/illustration
  ScrollView, // Use ScrollView if content might exceed screen height
  Text, // Import Text for button styling if needed
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient'; // Import for gradient
import { AuthStackParamList } from '../navigation/types';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button'; // Assuming a custom Button component exists
import { colors, spacing, typography } from '../theme';


type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    // Use gradient background via ScreenWrapper style prop override
    <ScreenWrapper 
        withScrollView={false} 
        style={styles.wrapper} // Apply wrapper base style
        safeAreaEdges={['top', 'bottom']} // Apply safe area to top and bottom
    >
       <LinearGradient
           // Example Gradient: Adjust colors and direction as needed
           colors={[colors.background, colors.primary + '20']} // Fades from background to light primary
           style={styles.gradient}
       >
          <ScrollView contentContainerStyle={styles.container}>
            {/* App Logo/Illustration (Optional) */}
            {/* <Image source={require('../assets/images/logo.png')} style={styles.logo} /> */}
            
            <ThemedText variant="header" size="h1" style={styles.title}>
              Welcome to Beardy!
            </ThemedText>
            
            <ThemedText style={styles.subtitle}>
              Your bearded dragon companion app.
            </ThemedText>

            {/* Feature Highlights - Centered */}
            <View style={styles.featuresContainer}>
                <ThemedText style={styles.featureText}>• Connect with a passionate community</ThemedText>
                <ThemedText style={styles.featureText}>• Get AI-powered care advice</ThemedText>
                <ThemedText style={styles.featureText}>• Track your beardie's husbandry</ThemedText>
                <ThemedText style={styles.featureText}>• Share photos and milestones</ThemedText>
            </View>

            <View style={styles.buttonContainer}>
              <Button 
                title="Get Started"
                onPress={() => navigation.navigate('SignUp')} 
                style={[styles.button, styles.primaryButton]} // Primary style
                // If Button has separate text style prop:
                // textStyle={styles.primaryButtonText} 
              />
              <Button 
                title="Sign In"
                onPress={() => navigation.navigate('SignIn')} 
                style={[styles.button, styles.secondaryButton]} // Secondary style
                // If Button has separate text style prop:
                // textStyle={styles.secondaryButtonText}
              />
            </View>
          </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background, // Fallback background
  },
  gradient: {
      flex: 1, // Ensure gradient fills the wrapper
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl, // More vertical padding
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl * 1.5, // More space after subtitle
    textAlign: 'center',
  },
  featuresContainer: {
      marginBottom: spacing.xl * 1.5, // More space after features
      alignItems: 'center', // Center feature text
      width: '100%', // Take full width for centering
  },
  featureText: {
      fontSize: typography.fontSizes.md,
      marginBottom: spacing.sm,
      lineHeight: typography.fontSizes.md * 1.5, 
      textAlign: 'center', // Center align feature text
      color: colors.textSecondary, // Slightly less prominent text
  },
  buttonContainer: {
    width: '90%', // Wider button container
    marginTop: spacing.lg,
  },
  button: {
    marginBottom: spacing.md, 
    // Common button styles (padding, height etc. might be in Button component itself)
    borderRadius: 25, // Example: Rounded buttons
    height: 50, // Example: Fixed height
    justifyContent: 'center', // Ensure text is centered vertically
  },
  primaryButton: {
    backgroundColor: colors.primary, // Primary background
  },
  // primaryButtonText: { // If Button supports textStyle prop
  //   color: colors.white,
  //   fontSize: typography.fontSizes.md,
  //   fontWeight: 'bold',
  // },
  secondaryButton: {
    backgroundColor: colors.white, // White background
    borderColor: colors.primary, // Primary border
    borderWidth: 1,
  },
  // secondaryButtonText: { // If Button supports textStyle prop
  //   color: colors.primary, // Primary text color
  //   fontSize: typography.fontSizes.md,
  //   fontWeight: 'bold',
  // },
});

export default WelcomeScreen; 