console.log("--- Executing AppNavigator.tsx ---");
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native'; // For loading state and TouchableOpacity, Import Image
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; // Import an icon set
import { colors, typography, spacing } from '../theme'; // Import our defined colors, typography, and spacing

// Import Hooks & Context
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Import screen components
import FeedScreen from '../screens/FeedScreen';
import AiVetScreen from '../screens/AiVetScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyBeardieScreen from '../screens/MyBeardieScreen'; // <-- Re-add this import
import CreatePostScreen from '../screens/CreatePostScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
// Import Auth & Onboarding Screens
import WelcomeScreen from '../screens/WelcomeScreen'; // Adjusted path if needed
import SignInScreen from '../screens/Auth/SignInScreen'; // Adjusted path if needed
import SignUpScreen from '../screens/Auth/SignUpScreen'; // Adjusted path if needed
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen'; // Keep if in AuthStack
import CreateProfileScreen from '../screens/Auth/CreateProfileScreen'; // Keep in RootStack
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen'; // Keep in RootStack
import SayHelloScreen from '../screens/SayHelloScreen'; // Import SayHelloScreen
import AddBeardieInfoScreen from '../screens/AddBeardieInfoScreen'; // <-- Import new screen

// Import Custom Components
import OnboardingHeader from '../components/OnboardingHeader'; // <-- Import the custom header
import MainHeader from '../components/MainHeader'; // <-- Import the new MainHeader

// Import Navigation Types - Assuming they are in the same file or separate
import { OnboardingStackParamList, RootStackParamList, AuthStackParamList, TabParamList, MainAppStackParamList } from './types';
import linkingConfig from './linkingConfig'; // Import linking config

// Define Navigators
const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>(); // Auth-specific stack
const OnboardingStack = createStackNavigator<OnboardingStackParamList>(); // <-- Define Onboarding Stack
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

// --- Onboarding Stack Component ---
const OnboardingStackNavigator = () => (
  <OnboardingStack.Navigator 
    initialRouteName="CreateProfile" // Start with profile creation
    // Use the custom header component
    screenOptions={{
        headerShown: true,
        header: (props) => <OnboardingHeader {...props} />
    }}
  >
    <OnboardingStack.Screen name="CreateProfile" component={CreateProfileScreen} />
    <OnboardingStack.Screen name="AddBeardieInfo" component={AddBeardieInfoScreen} />
    <OnboardingStack.Screen name="SayHello" component={SayHelloScreen} />
  </OnboardingStack.Navigator>
);

// Main App Tabs Component (Restored)
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({ // Destructure navigation here
      // Use the custom MainHeader component instead of default header
      header: (props) => <MainHeader {...props} />,
      // Remove headerRight as its logic is now in MainHeader
      // headerRight: ({ tintColor }) => { /* ... */ },
      // Keep other Tab specific options
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons['glyphMap'] = 'help-circle-outline';
        if (route.name === 'Feed') iconName = focused ? 'newspaper' : 'newspaper-outline';
        else if (route.name === 'AIChat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        else if (route.name === 'MyBeardie') iconName = focused ? 'home' : 'home-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.greyMedium,
      tabBarLabelStyle: styles.tabLabel, 
      tabBarStyle: styles.tabBar, 
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Community' }} />
    <Tab.Screen name="AIChat" component={AiVetScreen} options={{ tabBarLabel: 'Ask' }}/>
    <Tab.Screen name="MyBeardie" component={MyBeardieScreen} options={{ tabBarLabel: 'My Beardie' }}/>
  </Tab.Navigator>
);

// --- Simple Placeholder --- 
/*
const PlaceholderScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'cyan' }}>
    <Text>Placeholder</Text>
  </View>
);
*/

// --- Restore Main App Stack definition ---
const MainAppStackNavigator = () => (
  <MainAppStack.Navigator
    screenOptions={{
      // Default screen options for the stack if needed
      // Example: headerStyle, headerTintColor
    }}
    initialRouteName="MainTabs" 
  >
    <MainAppStack.Screen 
      name="MainTabs" 
      component={TabNavigator} 
      options={{ headerShown: false }} // Keep header hidden for the container of tabs itself
    />
    {/* --- Restore Settings screen --- */}
    <MainAppStack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ 
        title: 'Settings', // Set title for Settings screen
        headerShown: true // Show header for Settings screen itself
      }} 
    />
    {/* --- Restore CreatePost screen --- */}
    {/*
    <MainAppStack.Screen 
      name="PostDetail" 
      component={PostDetailScreen} 
      options={{ 
        title: 'Post', 
        headerShown: true 
      }} 
    />
    */}
  </MainAppStack.Navigator>
);

// --- Restore Loading Indicator --- 
const LoadingIndicator = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main App Navigator (Uses Root Stack)
const AppNavigator = () => {
  const {
      session, 
      profile, 
      beardie,
      loading: authLoading, 
      loadingProfile, 
      loadingBeardie,
      needsOnboardingPrompt
  } = useAuth();
  
  // Use state to track if the initial route has been determined
  const [isInitialRouteDetermined, setIsInitialRouteDetermined] = useState(false);
  const [currentStack, setCurrentStack] = useState<keyof RootStackParamList | undefined>(undefined);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const isMounted = useRef(false); // Track mount status

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; }; // Cleanup on unmount
  }, []);

  useEffect(() => {
    console.log("--- AppNavigator Routing Effect Running ---");
    const isLoadingCoreData = authLoading || loadingProfile || loadingBeardie;
    console.log(`States: isLoading=${isLoadingCoreData}, session=${!!session}, profile=${!!profile}, beardie=${!!beardie}, needsOnboardingPrompt=${needsOnboardingPrompt}`);

    if (isLoadingCoreData) {
      console.log("--> Waiting (loading core data)");
      return; // Wait until core data is loaded
    }
    
    let determinedStack: keyof RootStackParamList;

    if (!session) {
      determinedStack = 'AuthStack';
      console.log(`--> Determined Stack: ${determinedStack} (no session)`);
    } else { // Session exists
      if (!profile || !beardie || needsOnboardingPrompt) {
          determinedStack = 'OnboardingStack'; 
          console.log(`--> Determined Stack: ${determinedStack} (session, profile=${!!profile}, beardie=${!!beardie}, needsOnboardingPrompt=${needsOnboardingPrompt})`);
      } else { // Profile, beardie exist, prompt not needed
        determinedStack = 'MainAppStack';
        console.log(`--> Determined Stack: ${determinedStack} (session, profile, beardie, prompt_needed=false)`);
      }
    }
    
    // Only update state/reset navigation if the determined stack is different from the current one
    // or if the initial route hasn't been set yet.
    if (!isInitialRouteDetermined || determinedStack !== currentStack) {
       console.log(`--> Setting initial route/navigating. InitialDetermined: ${isInitialRouteDetermined}, Current: ${currentStack}, New: ${determinedStack}`);
       setCurrentStack(determinedStack);
       setIsInitialRouteDetermined(true); // Mark initial determination complete
       
       // Use reset only if navigation is ready and the stack *needs* to change fundamentally
       // This prevents resetting when just moving between screens within the same stack (e.g., CreateProfile -> AddBeardieInfo)
       if (navigationRef.current && isMounted.current) {
           navigationRef.current.reset({
               index: 0,
               routes: [{ name: determinedStack }],
           });
       }
    }
    
  // Dependencies: Only react to fundamental state changes that affect the *stack*.
  // Profile/beardie nullness determines Onboarding vs Main, session determines Auth vs others.
  // Loading states determine readiness.
  }, [session, profile, beardie, authLoading, loadingProfile, loadingBeardie, needsOnboardingPrompt, isInitialRouteDetermined, currentStack]); 

  // Show loading indicator until the initial route is determined *after* loading is complete
  if (!isInitialRouteDetermined) { 
    return <LoadingIndicator />;
  }

  // Render the navigator *only* after the initial route is determined
  return (
    <NavigationContainer 
        ref={navigationRef} 
        theme={appTheme} 
        linking={linkingConfig} 
        fallback={<LoadingIndicator />}
        onReady={() => {
           // Optional: Could potentially move the initial reset logic here 
           // if issues persist with the effect timing.
           console.log("Navigation Container Ready");
        }}
    >
      <RootStack.Navigator 
        initialRouteName={currentStack} // Use the state variable
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        <RootStack.Screen name="OnboardingStack" component={OnboardingStackNavigator} />
        <RootStack.Screen name="MainAppStack" component={MainAppStackNavigator} /> 
        <RootStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ presentation: 'modal' }} />
        <RootStack.Screen 
            name="AddBeardieInfo" 
            component={AddBeardieInfoScreen} 
            options={{ presentation: 'modal', headerShown: false }} 
        />
        <RootStack.Screen 
            name="CreatePost" 
            component={CreatePostScreen} 
            options={{ presentation: 'modal', title: 'Create Post', headerShown: true }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// Styles for the loading container and Tab Bar
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
  },
  tabBar: { // Style the tab bar
     backgroundColor: colors.white, // White background
     borderTopColor: colors.greyLight, // Light border top
     // Add slight shadow for elevation (optional)
     shadowColor: "#000",
     shadowOffset: { width: 0, height: -1 },
     shadowOpacity: 0.05,
     shadowRadius: 2,
     elevation: 5, 
  },
  tabLabel: { // Style the tab labels
      fontSize: 10, // Smaller font size
      fontFamily: typography.fonts.body, // Consistent font
      marginBottom: 2, // Adjust spacing if needed
  },
  // Add style for the header button
  headerButton: {
    marginRight: spacing.md, // Add some margin to the right
    padding: spacing.xs, // Add padding for easier tapping
  },
  // Add style for the header avatar
  headerAvatar: {
    width: 32, // Adjust size as needed
    height: 32,
    borderRadius: 16, // Make it circular
    borderWidth: 1, // Optional border
    borderColor: colors.greyLight, // Optional border color
  },
});

export default AppNavigator; 