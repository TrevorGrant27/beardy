import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types'; // Use the Root param list with nested structure

const prefix = Linking.createURL('/');

// Remove local RootStackParamList definition if it exists here
// export type RootStackParamList = { ... }; // DELETE THIS if present

const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix],
  config: {
    // Configure screens at the root level
    screens: {
      // Map paths to screens within the RootStack
      // React Navigation will navigate to the correct navigator based on the screen name
      AuthStack: { // Target the nested Auth navigator
         path: 'auth', // Optional: Define path prefix, e.g., beardyapp://auth/welcome
         screens: { 
             // Screens accessible WITHOUT a session typically
             Welcome: 'welcome',
             HighlightFeed: 'highlight-feed',
             HighlightAiVet: 'highlight-aivet',
             HighlightExplore: 'highlight-explore',
             JoinPrompt: 'join-prompt',
             SignUp: 'sign-up',
             SignIn: 'sign-in',
             ForgotPassword: 'forgot-password',
             // ResetPassword is now a root screen
         }
      },
      MainApp: { // Target the nested Main app navigator
         path: 'app', // Optional: e.g., beardyapp://app/explore
         screens: { 
            Explore: 'explore',
            Feed: 'feed',
            AiVet: 'ai-vet',
            Settings: 'settings',
            // Add nested stacks/screens if applicable
         }
      },
      // Screens directly within the RootStack
      ResetPassword: 'reset-password', // Map beardyapp://reset-password directly to the root screen
      CreateProfile: 'create-profile', // Optional: Allow linking directly if needed
      NotFound: '*' 
    },
  },
};

export default linkingConfig; 