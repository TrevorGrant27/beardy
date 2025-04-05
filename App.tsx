import * as Sentry from '@sentry/react-native';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';

// Initialize Sentry as early as possible
Sentry.init({
  dsn: 'https://c9b1937803e637e059e10e7658cd8466@o4509102505197568.ingest.us.sentry.io/4509102511161344', // <-- PASTE YOUR SENTRY DSN HERE
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // Set profilesSampleRate to 1.0 to profile 100%
  // of sampled transactions.
  // We recommend adjusting this value in production.
  profilesSampleRate: 1.0,
  // debug: __DEV__, // If `true`, Sentry will print debugging information - Temporarily disabled for testing transport
  debug: false,
});

function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button title='Send Sentry Test Event' onPress={ () => { Sentry.captureException(new Error('Sentry test event button clicked!')) }}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Wrap your root component with Sentry.wrap
export default Sentry.wrap(App);
