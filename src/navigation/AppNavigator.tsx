import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import an icon set
import { colors, typography } from '../theme'; // Import our defined colors and typography

// Import screen components
import ExploreScreen from '../screens/ExploreScreen';
import FeedScreen from '../screens/FeedScreen';
import AiVetScreen from '../screens/AiVetScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define type for Tab Navigator parameters (optional but good practice)
export type AppTabParamList = {
  Explore: undefined; // undefined means no params expected
  Feed: undefined;
  AiVet: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

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

const AppNavigator = () => {
  return (
    <NavigationContainer theme={appTheme}> 
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
    </NavigationContainer>
  );
};

export default AppNavigator; 