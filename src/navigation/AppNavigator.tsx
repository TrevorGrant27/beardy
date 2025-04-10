console.log("--- Executing AppNavigator.tsx ---");
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // For loading state
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import an icon set
import { colors, typography } from '../theme'; // Import our defined colors and typography

// Import Hooks & Context
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Import screen components
import ExploreScreen from '../screens/ExploreScreen';
import FeedScreen from '../screens/FeedScreen';
import AiVetScreen from '../screens/AiVetScreen';
import SettingsScreen from '../screens/SettingsScreen';
// Import Auth & Onboarding Screens
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import HighlightFeedScreen from '../screens/Onboarding/HighlightFeedScreen'; // Import
import HighlightAiVetScreen from '../screens/Onboarding/HighlightAiVetScreen'; // Import
import HighlightExploreScreen from '../screens/Onboarding/HighlightExploreScreen'; // Import
import JoinPromptScreen from '../screens/Onboarding/JoinPromptScreen'; // Import
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SignInScreen from '../screens/Auth/SignInScreen';
import CreateProfileScreen from '../screens/Auth/CreateProfileScreen'; // Import CreateProfileScreen
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen'; // Import ForgotPasswordScreen
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen'; // Import ResetPasswordScreen
// Import Navigation Types - Assuming they are in the same file or separate
import { AppTabParamList, AuthStackParamList } from './types';
import linkingConfig from './linkingConfig'; // Import linking config

// Define Navigators
const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createStackNavigator<AuthStackParamList>();

// Create a custom theme based on React Navigation's DefaultTheme
const appTheme = {
  ...DefaultTheme,
  dark: false, // Specify light theme
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary, // Basil Green (#A4C49D)
    background: colors.background, // Vanilla Bean (#FDF8F4)
    card: colors.cardBackground, // White
    text: colors.textPrimary, // Earth Brown (#2C2C1E)
    border: colors.greyLight, // Keep light grey for borders for now
    notification: colors.accent, // Peach Fuzz (#FFCCB6)
  },
  // It's common practice to extend the theme object with custom properties like fonts
  // Although NavigationContainer itself doesn't directly use these deeper properties,
  // making them available via context can be useful for custom components.
  // However, for applying base fonts, we often do it in screenOptions or global styles.
  // Let's set the header font via screenOptions for now.
};

// Auth Stack Component (Includes Onboarding)
const AuthStackNavigator = () => (
  <Stack.Navigator 
     initialRouteName="Welcome" 
     screenOptions={{ headerShown: false }}
  >
    {/* Onboarding Flow */}
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="HighlightFeed" component={HighlightFeedScreen} />
    <Stack.Screen name="HighlightAiVet" component={HighlightAiVetScreen} />
    <Stack.Screen name="HighlightExplore" component={HighlightExploreScreen} />
    <Stack.Screen name="JoinPrompt" component={JoinPromptScreen} />
    {/* Auth Actions */}
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> 
  </Stack.Navigator>
);

// Main App Tabs Component (Existing Tab Navigator refactored)
const MainAppTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Explore"
    screenOptions={({ route }) => {
      // Define options object explicitly
      const options = {
        // Tab Bar specific styling
        tabBarActiveTintColor: colors.primary, // Basil Green for active
        tabBarInactiveTintColor: colors.greyMedium,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.greyLight,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontFamily: typography.fonts.body },

        // Define icons based on route name
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = 'help-circle-outline';

          if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper-variant' : 'newspaper-variant-outline';
          } else if (route.name === 'AiVet') {
            iconName = focused ? 'robot-happy' : 'robot-happy-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },

        // Header styling
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: typography.fonts.header,
          fontSize: typography.fontSizes.h3,
        },
      };
      return options; // Return the options object
    }}
  >
    <Tab.Screen name="Explore" component={ExploreScreen} />
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="AiVet" component={AiVetScreen} options={{ title: 'AI Vet' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Loading Component (optional, for reuse)
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main App Navigator (Updated Conditional Logic & Linking)
const AppNavigator = () => {
  const { session, profile, loading, loadingProfile } = useAuth();

  // Log state right before rendering decision
  console.log("--- AppNavigator State ---");
  console.log("loading:", loading);
  console.log("loadingProfile:", loadingProfile);
  console.log("session exists:", !!session);
  console.log("profile exists:", !!profile);
  // console.log("profile data:", profile); // Optional: log full profile

  // Initial auth check loading state
  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    // Pass linking config and fallback to NavigationContainer
    <NavigationContainer theme={appTheme} linking={linkingConfig} fallback={<LoadingIndicator />}>
      {session ? (
        // User is authenticated
        loadingProfile ? (
          // Still loading profile
          <LoadingIndicator />
        ) : profile ? (
          // Profile exists, show main app
          <MainAppTabNavigator />
        ) : (
          // No profile, show profile creation
          <CreateProfileScreen />
        )
      ) : (
        // No session, show auth flow
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

// Styles for the loading container
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background, // Use theme background for consistency
  },
});

export default AppNavigator; 