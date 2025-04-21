import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Hook to get navigation
import { useAuth } from '../context/AuthContext'; // Hook to get profile
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets
import { colors, typography, spacing } from '../theme'; // Theme
import { MainAppStackParamList } from '../navigation/types'; // Import correct types for navigation
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation prop type more specifically for this context if needed
type MainHeaderNavigationProp = StackNavigationProp<MainAppStackParamList>;

const MainHeader: React.FC<BottomTabHeaderProps> = ({ route, options }) => {
  const { profile } = useAuth();
  // Use the specific type for navigation
  const navigation = useNavigation<MainHeaderNavigationProp>();
  // Get safe area insets
  const insets = useSafeAreaInsets(); 

  // Attempt to get title from options first, then route name
  const title = options.title ?? route.name;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.titleContainer}>
        {/* You could add a subtitle like "Tips and Ideas" here */}
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')} 
        style={styles.profileButton}
      >
        {profile?.avatar_url ? (
            <Image 
                source={{ uri: profile.avatar_url }}
                style={styles.profileAvatar}
            />
        ) : (
            <Ionicons name="person-circle-outline" size={32} color={colors.textPrimary} /> // Default icon
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from flex-end to center
    justifyContent: 'space-between', 
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background, 
    borderBottomWidth: 1, // Added subtle border bottom
    borderBottomColor: colors.greyLight, // Added subtle border bottom
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fonts.header,
    fontSize: typography.fontSizes.h2, 
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  profileButton: {
    marginLeft: spacing.md, 
  },
  profileAvatar: {
    width: 40, 
    height: 40,
    borderRadius: 20, 
    // borderWidth: 1, // Removed border
    // borderColor: colors.greyMedium, // Removed border
  },
});

export default MainHeader; 