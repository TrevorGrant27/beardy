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
  // ResetPassword is moved to Root stack
};

// Type definitions for the main app bottom tab navigator
export type TabParamList = {
  // Explore: undefined; // Removed Explore tab
  Feed: undefined;
  AIChat: undefined;
  Settings: undefined;
};

// Root navigator parameter list combining main navigators
// Used for top-level navigation actions and linking config typing
// Note: Screens rendered directly (like CreateProfileScreen) are not listed here
export type RootStackParamList = {
  // Use NavigatorScreenParams to type nested navigators
  AuthStack: NavigatorScreenParams<AuthStackParamList>; // Navigator shown when logged out
  MainAppStack: NavigatorScreenParams<MainAppStackParamList>; // Changed to MainAppStack
  ResetPassword: { token: string } | undefined; // Can be undefined if opened not via deep link
  CreateProfile: undefined; // Moved here: Shown after login if profile doesn't exist
  NotFound: undefined;           // Optional: For handling not found routes
};

// You might also define types for your main app navigator (e.g., Bottom Tabs) here
// export type MainAppTabParamList = { ... };

// And potentially combine them if needed for nested navigation
// export type RootStackParamList = { ... };

// --- Main App Stack (Includes Tabs and other screens within the authenticated app) ---
export type MainAppStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>; // The Bottom Tab Navigator
  // Removed CategoryDetail
  // Removed ResourceDetail
  CreatePost: undefined; // Screen for creating a new post
  PostDetail: { postId: string }; // Screen to show a single post and its comments
  // Add other screens accessible after login, e.g., EditProfile etc.
}; 