// src/navigation/types.ts

import { NavigatorScreenParams } from '@react-navigation/native'; // Import NavigatorScreenParams

// Type definitions for the authentication flow stack navigator
export type AuthStackParamList = {
  Welcome: undefined; // No params expected for Welcome screen
  // Onboarding Feature Highlights
  HighlightFeed: undefined;
  HighlightAiVet: undefined;
  HighlightExplore: undefined;
  JoinPrompt: undefined; // Final onboarding screen before auth actions
  // Auth Actions
  SignUp: undefined; // No params expected for SignUp screen
  SignIn: undefined; // No params expected for SignIn screen
  ForgotPassword: undefined; // Added ForgotPassword route
  ResetPassword: undefined; // Added ResetPassword route
  // Add other auth-related screens here later (e.g., ResetPasswordForm)
};

// Type definitions for the main app bottom tab navigator
export type AppTabParamList = {
  Explore: undefined;
  Feed: undefined;
  AiVet: undefined; // Or use a specific name like 'AIChat'
  Settings: undefined;
};

// Root navigator parameter list combining main navigators
// Used for top-level navigation actions and linking config typing
// Note: Screens rendered directly (like CreateProfileScreen) are not listed here
export type RootStackParamList = {
  // Use NavigatorScreenParams to type nested navigators
  AuthStack: NavigatorScreenParams<AuthStackParamList>; // Refers to the stack navigator itself
  MainApp: NavigatorScreenParams<AppTabParamList>;      // Refers to the tab navigator itself
  NotFound: undefined;           // Optional: For handling not found routes
};

// You might also define types for your main app navigator (e.g., Bottom Tabs) here
// export type MainAppTabParamList = { ... };

// And potentially combine them if needed for nested navigation
// export type RootStackParamList = { ... }; 