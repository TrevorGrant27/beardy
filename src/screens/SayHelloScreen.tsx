import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../navigation/types';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

const SayHelloScreen: React.FC = () => {
  const { clearOnboardingPrompt } = useAuth();
  // Use any-navigation to allow root-level routes
  const navigation = useNavigation<any>();
  // Acquire root navigator for modal/create-post and stack resets
  const rootNav = navigation.getParent();

  const handlePost = () => {
    console.log("SayHello: navigating to CreatePost modal");
    rootNav?.navigate('CreatePost');
  };

  const handleSkip = () => {
    console.log("SayHello: Skipping, navigating to Feed");
    clearOnboardingPrompt();
    // Reset the root navigator to MainAppStack
    rootNav?.reset({
      index: 0,
      routes: [
        {
          name: 'MainAppStack',
          params: {
            screen: 'MainTabs',
            params: { screen: 'Feed' },
          },
        },
      ],
    });
  };

  return (
    <ScreenWrapper contentContainerStyle={styles.container}>
      <ThemedText variant="header" size="h1" style={styles.title}>Say Hello!</ThemedText>
      <ThemedText style={styles.description}>
        Welcome to the Beardy community! Why not introduce yourself or share a photo of your beardie? 
        Your first post will appear on the feed.
      </ThemedText>
      
      <View style={styles.buttonContainer}>
        <Button 
            title="Post Something" 
            onPress={handlePost} 
            style={[styles.button, styles.primaryButton]}
            textStyle={styles.primaryButtonText}
        />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
            <ThemedText style={styles.skipButtonText}>Skip for now</ThemedText>
         </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSizes.lg,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.fontSizes.lg * 1.4,
    color: colors.textSecondary,
  },
  buttonContainer: {
    width: '80%',
    marginTop: spacing.md,
  },
  button: {
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
  },
  skipButtonContainer: {
      marginTop: spacing.sm,
      alignSelf: 'center',
  },
  skipButtonText: {
      fontSize: typography.fontSizes.sm,
      color: colors.textSecondary,
      textDecorationLine: 'underline',
  },
});

export default SayHelloScreen; 