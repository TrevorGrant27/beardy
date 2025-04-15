// src/navigation/types.ts

import { NavigatorScreenParams } from '@react-navigation/native'; // Import NavigatorScreenParams

// Type definitions for the authentication flow stack navigator
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined; // Assuming ForgotPassword initiated from SignIn
  // Remove any other old onboarding screens if they were listed here
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
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainAppStack: NavigatorScreenParams<MainAppStackParamList>;
  ResetPassword: { token: string } | undefined;
  CreateProfile: undefined;
  SayHello: undefined; // Add the new SayHello screen route
  NotFound: undefined;
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