import React from 'react';
import {
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { theme } from '../theme';

// Allow either standard View props or ScrollView props
interface ScreenWrapperProps extends ViewProps, ScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  withScrollView?: boolean; // Option to wrap content in ScrollView
  safeAreaEdges?: SafeAreaViewProps['edges']; // Control which edges apply safe area
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  withScrollView = true, // Default to using ScrollView
  safeAreaEdges = ['top', 'right', 'left'], // Default safe edges (avoid bottom for tabs/inputs)
  contentContainerStyle, // Capture ScrollView specific prop
  ...rest
}) => {
  const content = withScrollView ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps="handled" // Good default for forms
      {...rest} // Pass ScrollView specific props
    >
      {children}
    </ScrollView>
  ) : (
    children // Render children directly if no scroll view needed
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, style]} // Apply custom styles to SafeAreaView
      edges={safeAreaEdges}
      {...(withScrollView ? {} : rest)} // Pass View specific props if not using ScrollView
    >
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background, // Apply background color
  },
  scrollView: {
    flex: 1, // Ensure ScrollView takes up space
  },
  scrollContentContainer: {
    flexGrow: 1, // Allow content to grow and enable scrolling
    padding: theme.spacing.md, // Default padding for screen content
  },
});

export default ScreenWrapper; 