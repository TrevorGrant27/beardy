// Define font families, sizes, weights etc.
// Example:
// export const fonts = {
//   regular: 'Inter-Regular', // Assuming Inter font is setup
//   bold: 'Inter-Bold',
// };
//
// export const fontSizes = {
//   sm: 12,
//   md: 16,
//   lg: 20,
// };
//
// export const fontWeights = {
//   normal: '400',
//   bold: '700',
// };

export const fonts = {
  header: 'Fredoka-SemiBold', // Using SemiBold for headers, adjust if needed
  body: 'DMSans-Regular',
  button: 'Outfit-Regular', // Using Regular for buttons, adjust if needed

  // Add specific weights if needed directly
  fredokaLight: 'Fredoka-Light',
  fredokaRegular: 'Fredoka-Regular',
  fredokaMedium: 'Fredoka-Medium',
  fredokaSemiBold: 'Fredoka-SemiBold',
  fredokaBold: 'Fredoka-Bold',

  dmSansRegular: 'DMSans-Regular',
  dmSansMedium: 'DMSans-Medium',
  dmSansBold: 'DMSans-Bold',
  dmSansItalic: 'DMSans-Italic',

  outfitRegular: 'Outfit-Regular',
  outfitBold: 'Outfit-Bold',
  outfitBlack: 'Outfit-Black',
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14, // Default body size
  lg: 16,
  xl: 18,
  h1: 32,
  h2: 24,
  h3: 20,
  button: 16,
};

// Use the exact string literals expected by RN fontWeight style
export const fontWeights = {
  light: '300', 
  normal: '400',
  medium: '500', // Keep as '500'
  semiBold: '600',
  bold: '700',
  black: '900',
} as const; // Use 'as const' for stricter typing, ensuring values are literals

// Optional: Combine into a typography object
export const typography = {
  fonts,
  fontSizes,
  fontWeights,
}; 