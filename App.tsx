import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import CustomErrorBoundary from './src/components/CustomErrorBoundary';
import { globalErrorHandler } from './src/utils/errorHandler';
import ErrorFallback from './src/components/ErrorFallback';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Define font map - Keys are the names we'll use in styles
    'DMSans-Regular': require('./assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('./assets/fonts/DMSans-Medium.ttf'),
    'DMSans-Bold': require('./assets/fonts/DMSans-Bold.ttf'),
    'DMSans-Italic': require('./assets/fonts/DMSans-Italic.ttf'),
    'Fredoka-Light': require('./assets/fonts/Fredoka-Light.ttf'),
    'Fredoka-Regular': require('./assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('./assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('./assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('./assets/fonts/Fredoka-Bold.ttf'),
    'Outfit-Regular': require('./assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'Outfit-Black': require('./assets/fonts/Outfit-Black.ttf'),
  });

  // Hide splash screen once fonts are loaded or an error occurs
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Render nothing if fonts are not loaded and no error occurred
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Log font loading error if it occurs (optional but helpful)
  if (fontError) {
    console.error('Error loading fonts:', fontError);
    // Consider showing a specific font loading error UI here
  }

  return (
    <CustomErrorBoundary>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppNavigator />
        <StatusBar style="auto" />
      </View>
    </CustomErrorBoundary>
  );
}

export default App;
