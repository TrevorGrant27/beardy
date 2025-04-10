import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, typography, spacing } from '../../theme';

type ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'HighlightExplore'>;

interface HighlightExploreScreenProps {
  navigation: ScreenNavigationProp;
}

const HighlightExploreScreen: React.FC<HighlightExploreScreenProps> = ({ navigation }) => {
  const goToNext = () => navigation.navigate('JoinPrompt');
  const goBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <View style={styles.illustrationArea}>
        <Text style={styles.placeholderText}>[Explore Hub Mockup Here]</Text>
      </View>

      <Text style={styles.heading}>Expert Care Resources</Text>
      <Text style={styles.description}>
        Access guides on diet, habitat, health, and more from verified sources.
      </Text>

      <Text style={styles.progressText}>4 / 5</Text>

      <View style={styles.navContainer}>
        <Pressable
          style={({ pressed }) => [styles.navButton, styles.prevButton, pressed && styles.buttonPressed]}
          onPress={goBack}
        >
          <Text style={styles.navButtonTextPrev}>Previous</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.navButton, styles.nextButton, pressed && styles.buttonPressed]}
          onPress={goToNext}
        >
          <Text style={styles.navButtonTextNext}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
};

// Reuse styles or define separately
const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingBottom: spacing.xl, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'space-between' },
  illustrationArea: { width: '90%', aspectRatio: 1.2, backgroundColor: colors.greyLight, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xl },
  placeholderText: { color: colors.greyMedium, fontFamily: typography.fonts.body },
  heading: { fontFamily: typography.fonts.header, fontSize: typography.fontSizes.h2, color: colors.textPrimary, fontWeight: typography.fontWeights.bold, textAlign: 'center', marginBottom: spacing.md },
  description: { fontFamily: typography.fonts.body, fontSize: typography.fontSizes.lg, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  progressText: { fontFamily: typography.fonts.body, fontSize: typography.fontSizes.sm, color: colors.greyMedium, marginBottom: spacing.md },
  navContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: spacing.md },
  navButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  prevButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.greyLight },
  nextButton: { backgroundColor: colors.primary },
  navButtonTextBase: { fontFamily: typography.fonts.button, fontSize: typography.fontSizes.button, fontWeight: typography.fontWeights.medium },
  navButtonTextPrev: { color: colors.textPrimary },
  navButtonTextNext: { color: colors.white },
  buttonPressed: { opacity: 0.8 },
});

export default HighlightExploreScreen; 