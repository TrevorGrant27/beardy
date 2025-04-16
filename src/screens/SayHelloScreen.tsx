import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

type SayHelloScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SayHello'>;

interface Props {
  navigation: SayHelloScreenNavigationProp;
}

const SayHelloScreen: React.FC<Props> = ({ navigation }) => {
  const { clearOnboardingPrompt } = useAuth();

  const handlePost = () => {
    console.log("SayHello: Navigating to CreatePost");
    clearOnboardingPrompt();
    navigation.navigate('MainAppStack', { screen: 'CreatePost' });
  };

  const handleSkip = () => {
    console.log("SayHello: Skipping, navigating to Feed");
    clearOnboardingPrompt();
    navigation.reset({
        index: 0,
        routes: [
            { name: 'MainAppStack', params: { screen: 'MainTabs', params: { screen: 'Feed' } } }
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
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