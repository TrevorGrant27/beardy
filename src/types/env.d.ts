// Type definition for environment variables used in the app.
// This file provides global type safety for environment variables
// loaded via react-native-dotenv.

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;

  // Add other environment variables here if needed
} 