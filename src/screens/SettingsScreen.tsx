import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { colors, spacing, typography } from '../theme'; // Import theme

const SettingsScreen = () => {
  const { signOut, user, profile } = useAuth(); // Get signOut function and user/profile info

  const handleSignOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Could not log out. Please try again.');
            } 
            // No navigation needed, AppNavigator handles the switch on session change
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      {/* Display User Info */}  
      {user && (
          <View style={styles.userInfoContainer}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
          </View>
      )}
       {profile && (
          <View style={styles.userInfoContainer}>
              <Text style={styles.infoLabel}>Username:</Text>
              <Text style={styles.infoValue}>{profile.username}</Text>
          </View>
      )}

      {/* TODO: Add other settings options here later (Change Password, etc.) */}

      <Pressable
        style={({ pressed }) => [styles.button, styles.logoutButton, pressed && styles.buttonPressed]}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl, // More padding at the top
    backgroundColor: colors.background,
  },
  header: {
      fontFamily: typography.fonts.header,
      fontSize: typography.fontSizes.h2,
      color: colors.textPrimary,
      fontWeight: typography.fontWeights.bold,
      marginBottom: spacing.xl,
      textAlign: 'center',
  },
  userInfoContainer: {
      backgroundColor: colors.white,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.md,
      borderColor: colors.greyLight,
      borderWidth: 1,
  },
  infoLabel: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
  },
  infoValue: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.md,
      color: colors.textPrimary,
      fontWeight: typography.fontWeights.medium,
  },
  button: { // Base button style if needed
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: spacing.lg, // Space above the button
  },
  logoutButton: { // Specific logout button style
    backgroundColor: colors.white,
    borderColor: colors.error,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontFamily: typography.fonts.button,
    fontSize: typography.fontSizes.button,
    color: colors.error, // Error color for destructive action
    fontWeight: typography.fontWeights.bold,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default SettingsScreen; 