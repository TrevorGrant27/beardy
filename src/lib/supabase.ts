console.log("--- Executing supabase.ts ---");
import 'react-native-url-polyfill/auto'; // Required for Supabase storage & deep linking
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Log the values read from environment *before* validation/use
console.log("--- Supabase Env Vars --- (supabase.ts)");
console.log("SUPABASE_URL read:", SUPABASE_URL ? SUPABASE_URL.substring(0, 20) + '...' : 'MISSING/UNDEFINED');
console.log("SUPABASE_ANON_KEY read:", SUPABASE_ANON_KEY ? '[Key Loaded]' : 'MISSING/UNDEFINED');
// Note: Only logging first part of URL and confirmation for key

// Define a simple adapter for SecureStore
const ExpoSecureStoreAdapter = {
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

// Validate environment variables
if (!SUPABASE_URL) {
  console.error("CRITICAL ERROR in supabase.ts: Missing SUPABASE_URL");
  throw new Error("Missing environment variable: SUPABASE_URL");
}
if (!SUPABASE_ANON_KEY) {
  console.error("CRITICAL ERROR in supabase.ts: Missing SUPABASE_ANON_KEY");
  throw new Error("Missing environment variable: SUPABASE_ANON_KEY");
}

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});

// Type definition for environment variables if using TypeScript
// DELETED 