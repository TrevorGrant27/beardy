import React from 'react';
import {
  View,
  StyleSheet,
  Image, // Keep Image if using logo/illustration
  ScrollView, // Use ScrollView if content might exceed screen height
  Text, // Import Text for button styling if needed
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
// import { LinearGradient } from 'expo-linear-gradient'; // Import for gradient - REMOVED
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
       {/* <LinearGradient
           // Refined Gradient: Subtle gradient from background towards a hint of primary
           colors={[colors.background, colors.background, colors.primary + '1A']} // Background -> Background -> Light Primary Tint
           locations={[0, 0.6, 1]} // Control gradient distribution
           style={styles.gradient}
       > */}
       {/* Replace LinearGradient with a simple View having the same flex style */}
       <View style={styles.gradient}> 
          <ScrollView contentContainerStyle={styles.container}>
            {/* Optional Logo - keep commented out unless needed
            <Image source={require('../assets/images/logo-light.png')} style={styles.logo} /> 
            */}
            
            <ThemedText variant="header" size="h1" style={styles.title}>
              Welcome to Beardy!
            </ThemedText>
            
            <ThemedText variant="body" style={styles.subtitle}>
              Your bearded dragon companion app.
            </ThemedText>

            {/* Feature Highlights - Improved styling */}
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
                style={[styles.button, styles.primaryButton]}
                textStyle={styles.primaryButtonText}
              />
              <Button 
                title="Sign In"
                onPress={() => navigation.navigate('SignIn')} 
                style={[styles.button, styles.secondaryButton]}
                textStyle={styles.secondaryButtonText}
              />
            </View>
          </ScrollView>
      {/* </LinearGradient> */}
      </View> 
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background, // Base background just in case
  },
  gradient: {
      flex: 1, // Ensure gradient fills the wrapper
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    paddingHorizontal: spacing.lg, // Consistent horizontal padding
    paddingBottom: spacing.xl, // Padding at the bottom
    paddingTop: spacing.xxl, // More padding at the top if no logo
  },
  logo: {
    width: 150, // Slightly larger logo if used
    height: 150,
    resizeMode: 'contain',
    marginBottom: spacing.xl,
    marginTop: spacing.lg, // Add some top margin if logo is present
  },
  title: {
    // Uses 'display' variant from ThemedText, assuming it's large and bold
    marginBottom: spacing.md, // Space after title
    textAlign: 'center',
    color: colors.textPrimary, // Ensure primary text color
  },
  subtitle: {
    // Uses 'body' variant, adjust size/color if needed via props or style
    fontSize: typography.fontSizes.lg, // Keep slightly larger subtitle
    color: colors.textSecondary,
    marginBottom: spacing.xxl, // More space after subtitle before features
    textAlign: 'center',
  },
  featuresContainer: {
      marginBottom: spacing.xxl, // More space after features before buttons
      alignItems: 'flex-start', // Align text to the start (left)
      width: '90%', // Constrain width slightly
      paddingLeft: spacing.md, // Indent feature list slightly
  },
  featureText: {
      fontSize: typography.fontSizes.md,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      lineHeight: typography.fontSizes.md * 1.4, // Use calculated line height
      textAlign: 'left', // Align feature text left
  },
  buttonContainer: {
    width: '90%', // Maintain button container width
    alignSelf: 'center', // Ensure container itself is centered
  },
  button: {
    marginBottom: spacing.md, 
    // Styling like height, padding, borderRadius should ideally be handled
    // within the Button component based on the `variant` prop.
    // Avoid overriding them here unless absolutely necessary.
  },
  primaryButton: {
    backgroundColor: colors.primary, 
  },
  primaryButtonText: { 
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any, // Assuming fontWeight needs casting sometimes
  },
  secondaryButton: { 
    backgroundColor: colors.white, // Explicit white background
    borderColor: colors.primary, // Primary border
    borderWidth: 1,
  },
  secondaryButtonText: { 
    color: colors.primary, // Primary text color
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any, // Assuming fontWeight needs casting sometimes
  },
});

export default WelcomeScreen; 