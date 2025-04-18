import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackHeaderProps } from '@react-navigation/stack';
import { colors, typography, spacing } from '../theme'; // Adjust path as needed

const OnboardingHeader: React.FC<StackHeaderProps> = ({ route }) => {
  let currentStep = 0;
  const totalSteps = 3;

  // Determine current step based on route name
  switch (route.name) {
    case 'CreateProfile':
      currentStep = 1;
      break;
    case 'AddBeardieInfo':
      currentStep = 2;
      break;
    case 'SayHello':
      currentStep = 3;
      break;
    default:
      currentStep = 0; // Should not happen in this stack
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        {[...Array(totalSteps)].map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= currentStep;
          // Optional: highlight the current step differently
          // const isActive = stepNumber === currentStep;
          
          return (
            <View 
              key={stepNumber} 
              style={[
                styles.circle,
                isCompleted ? styles.circleFilled : styles.circleUnfilled,
                // isActive ? styles.circleActive : null, // Optional active style
              ]}
            />
          );
        })}
      </View>
      {/* Optional: Add back title or step text if needed */}
      {/* <Text style={styles.stepText}>Step {currentStep} / {totalSteps}</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80, // Increase height to accommodate more padding
    justifyContent: 'flex-end', // Align items to the bottom after padding
    alignItems: 'center',
    backgroundColor: colors.background, 
    // borderBottomWidth: 1, // Remove border
    // borderBottomColor: colors.greyLight, // Remove border
    paddingTop: spacing.xxl, // Increase paddingTop even further
    paddingBottom: spacing.sm, // Add a little padding at the bottom 
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm, // Add some vertical space
  },
  circle: {
    width: 12, // Size of the circle
    height: 12,
    borderRadius: 6, // Make it round
    marginHorizontal: spacing.sm, // Space between circles
  },
  circleFilled: {
    backgroundColor: colors.primary, // Color for completed steps
  },
  circleUnfilled: {
    backgroundColor: colors.greyMedium, // Color for incomplete steps
    // Optionally add a border instead of background
    // borderWidth: 1,
    // borderColor: colors.greyMedium,
    // backgroundColor: 'transparent', 
  },
  // Optional style for the active step circle
  // circleActive: {
  //   borderColor: colors.primary, // Example: add a border to active
  //   borderWidth: 2,
  // },
  // Optional style for text if you add it back
  // stepText: {
  //   fontFamily: typography.fonts.body,
  //   fontSize: typography.fontSizes.md,
  //   color: colors.textSecondary,
  //   fontWeight: typography.fontWeights.medium,
  //   marginTop: spacing.xs, // Space it below circles if needed
  // },
});

export default OnboardingHeader; 