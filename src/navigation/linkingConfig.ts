import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './types'; // Use the updated Root param list

const prefix = Linking.createURL('/');

// Remove local RootStackParamList definition if it exists here
// export type RootStackParamList = { ... }; // DELETE THIS if present

const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix],
  config: {
    // Configure screens at the root level
    screens: {
      // Define paths for screens within the AuthStack navigator
      AuthStack: {
         screens: { // Screens within the AuthStack
             ResetPassword: 'reset-password', // Maps prefix + 'reset-password'
             // Add other explicit auth paths if needed:
             // SignIn: 'sign-in' 
             // ...etc
         }
      },
      // Define paths for screens within the MainApp navigator
      MainApp: {
         // path: 'app', // Optional path prefix for main app
         screens: { // Screens within the MainApp
            // Explore: 'explore', 
            // Feed: 'feed',
            // ...etc
         }
      },
      NotFound: '*' // Catch-all
    },
  },
};

export default linkingConfig; 