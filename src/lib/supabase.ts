import 'react-native-url-polyfill/auto'; // Needed for Supabase to work in React Native
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'; // Import from .env

// Define a SecureStoreAdapter for Supabase
const SecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Ensure environment variables are loaded
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'ERROR: Supabase URL or Anon Key missing. Make sure .env file is set up correctly.'
  );
  // Optionally throw an error or handle this state appropriately
  // throw new Error('Supabase environment variables are not set.');
}

// Create the Supabase client
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    storage: SecureStoreAdapter, // Use SecureStore for session persistence
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
}); 