import { colors } from './colors';
import spacing from './spacing';
import { fonts, fontSizes, fontWeights, typography } from './typography'; // Import typography

export const theme = {
  colors,
  spacing,
  typography, // Add typography
};

// Export individual parts if needed directly
export * from './colors';
export { default as spacing } from './spacing'; // Correct way to re-export a default export
export * from './typography'; // Export typography 