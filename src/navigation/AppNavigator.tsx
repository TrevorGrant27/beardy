console.log("--- Executing AppNavigator.tsx ---");
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // For loading state
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; // Import an icon set
import { colors, typography } from '../theme'; // Import our defined colors and typography

// Import Hooks & Context
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Import screen components
import FeedScreen from '../screens/FeedScreen';
import AiVetScreen from '../screens/AiVetScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreatePostScreen from '../screens/CreatePostScreen'; // Keep CreatePostScreen import
import PostDetailScreen from '../screens/PostDetailScreen'; // Add import for PostDetailScreen
// Import Auth & Onboarding Screens
import WelcomeScreen from '../screens/WelcomeScreen'; // Adjusted path if needed
import SignInScreen from '../screens/Auth/SignInScreen'; // Adjusted path if needed
import SignUpScreen from '../screens/Auth/SignUpScreen'; // Adjusted path if needed
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen'; // Keep if in AuthStack
import CreateProfileScreen from '../screens/Auth/CreateProfileScreen'; // Keep in RootStack
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen'; // Keep in RootStack
import SayHelloScreen from '../screens/SayHelloScreen'; // Import SayHelloScreen

// Import Navigation Types - Assuming they are in the same file or separate
import { RootStackParamList, AuthStackParamList, TabParamList, MainAppStackParamList } from './types';
import linkingConfig from './linkingConfig'; // Import linking config

// Define Navigators
const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>(); // Auth-specific stack
const RootStack = createStackNavigator<RootStackParamList>(); // New Root stack
const MainAppStack = createStackNavigator<MainAppStackParamList>(); // Create the Main App Stack

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

// Auth Stack Component (Simplified)
const AuthStackNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    {/* Remove other old onboarding screens if any were here */}
  </AuthStack.Navigator>
);

// Main App Tabs Component (Existing Tab Navigator refactored)
const TabNavigator = () => (
  <Tab.Navigator
    // initialRouteName="Feed" // Optional: explicitly set, but Feed is now first
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons['glyphMap'] = 'help-circle-outline';
        // Adjust icons based on remaining tabs
        if (route.name === 'Feed') iconName = focused ? 'newspaper' : 'newspaper-outline';
        else if (route.name === 'AIChat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.greyMedium,
    })}
  >
    {/* <Tab.Screen name="Explore" component={ExploreScreen} /> // Remove Explore Tab.Screen */}
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="AIChat" component={AiVetScreen} /> 
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Main App Stack Navigator Component (New)
const MainAppStackNavigator = () => (
  <MainAppStack.Navigator
    screenOptions={{
      // Let's show headers for stack screens by default, hide for Tabs
      // headerShown: false, 
    }}
    initialRouteName="MainTabs" // Explicitly start on Tabs
  >
    <MainAppStack.Screen 
      name="MainTabs" 
      component={TabNavigator} 
      options={{ headerShown: false }} // Hide header specifically for the Tabs screen
    />
    {/* Removed Category/Resource Detail Screens */}
    <MainAppStack.Screen 
      name="CreatePost" 
      component={CreatePostScreen} 
      options={{ 
        title: 'Create Post', 
        headerShown: true // Show header for Create Post screen
        // Consider adding presentation: 'modal' if desired
        // presentation: 'modal', 
      }} 
    />
    {/* Add PostDetail screen */}
    <MainAppStack.Screen 
      name="PostDetail" 
      component={PostDetailScreen} 
      options={{ 
        title: 'Post', // Keep title generic or set dynamically later
        headerShown: true 
      }} 
    />
    {/* Add other screens like EditProfile here */}
  </MainAppStack.Navigator>
);

// Loading Component (optional, for reuse)
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main App Navigator (Uses Root Stack)
const AppNavigator = () => {
  const { session, profile, loading: authLoading, loadingProfile, needsOnboardingPrompt } = useAuth();
  const [initialRouteName, setInitialRouteName] = useState<keyof RootStackParamList | undefined>(undefined);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    console.log("--- AppNavigator Effect Running ---");
    console.log(`States: authLoading=${authLoading}, loadingProfile=${loadingProfile}, session=${!!session}, profile=${!!profile}, needsOnboardingPrompt=${needsOnboardingPrompt}`);

    if (!authLoading) { 
      if (!session) {
        console.log("--> Determining Route: AuthStack (no session)");
        setInitialRouteName('AuthStack');
      } else { // Session exists
          if (!loadingProfile) { // Only proceed if profile status is known
              if (!profile) {
                  console.log("--> Determining Route: CreateProfile (session, no profile)");
                  setInitialRouteName('CreateProfile'); 
              } else if (needsOnboardingPrompt) { // Profile exists, BUT needs prompt
                  console.log("--> Determining Route: SayHello (session, profile, needs prompt)");
                  setInitialRouteName('SayHello');
              } else { // Profile exists and prompt not needed
                  console.log("--> Determining Route: MainAppStack (session, profile, no prompt needed)");
                  setInitialRouteName('MainAppStack');
              }
          } else {
              // Session exists, but still loading profile - wait
              console.log("--> Determining Route: Waiting (session, loading profile)");
              setInitialRouteName(undefined); // Stay in loading state
          }
      }
    } else {
      // Still loading initial auth state - wait
      console.log("--> Determining Route: Waiting (loading auth)");
      setInitialRouteName(undefined); // Stay in loading state
    }
  }, [session, profile, authLoading, loadingProfile, needsOnboardingPrompt]); // Add needsOnboardingPrompt dependency

  if (initialRouteName === undefined) { 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer 
        ref={navigationRef} 
        theme={appTheme} 
        linking={linkingConfig} 
        fallback={<LoadingIndicator />}
    >
      <RootStack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        <RootStack.Screen name="MainAppStack" component={MainAppStackNavigator} />
        <RootStack.Screen name="CreateProfile" component={CreateProfileScreen} />
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ presentation: 'modal' }} />
        <RootStack.Screen name="SayHello" component={SayHelloScreen} />
      </RootStack.Navigator>
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