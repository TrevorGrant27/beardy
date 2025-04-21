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
  MyBeardie: undefined;
  AIChat: undefined;
};

// --- Onboarding Stack --- 
export type OnboardingStackParamList = {
    CreateProfile: undefined;
    AddBeardieInfo: undefined;
    SayHello: undefined;
};

// --- Root Stack --- 
export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  OnboardingStack: NavigatorScreenParams<OnboardingStackParamList>; // <-- Add Onboarding stack
  MainAppStack: NavigatorScreenParams<MainAppStackParamList>;
  ResetPassword: { token: string } | undefined;
  AddBeardieInfo: { presentedModally?: boolean } | undefined;
  CreatePost: undefined; // <-- Add CreatePost here for modal presentation
  NotFound: undefined; // Optional: For handling unknown routes
};

// You might also define types for your main app navigator (e.g., Bottom Tabs) here
// export type MainAppTabParamList = { ... };

// And potentially combine them if needed for nested navigation
// export type RootStackParamList = { ... };

// --- Main App Stack (Includes Tabs and other screens within the authenticated app) ---
export type MainAppStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>; // The Bottom Tab Navigator
  PostDetail: { postId: string }; // Screen to show a single post and its comments
  Settings: undefined; // <-- Add this line
  // Add other screens accessible after login, e.g., EditProfile etc.
}; 