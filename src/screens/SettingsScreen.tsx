import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { colors, spacing, typography } from '../theme'; // Import theme
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { supabase } from '../lib/supabase'; // Import supabase client
import { Ionicons } from '@expo/vector-icons'; // Import icons

// Helper function (can be moved to a utils file)
const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  return match ? match[1] : null;
};

const SettingsScreen = () => {
  const { signOut, user, profile, refreshProfile } = useAuth(); // Get signOut function, user/profile info, and refreshProfile
  const [isUploading, setIsUploading] = useState(false);

  const handleChooseAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access in settings.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for avatars
        quality: 0.8, // Reduce quality slightly
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        await uploadAvatar(uri);
      }
    } catch (error) {
      console.error("ImagePicker Error: ", error);
      Alert.alert("Image Error", "Could not select image.");
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!user) return;
    if (!profile) return; // Need profile to potentially update

    const fileExt = getFileExtension(uri);
    if (!fileExt) {
        Alert.alert("Upload Error", "Could not determine file type.");
        return;
    }
    const fileName = `avatar.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Store under user's ID
    const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`; // Adjust for jpeg

    setIsUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', {
          uri: uri, // File URI from picker
          name: fileName, // Desired file name
          type: contentType, // MIME type
      } as any); // Use 'as any' to bypass strict type checking for RN file object

      // Use supabase-js upload method with FormData
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-avatars') // Your bucket name
        .upload(filePath, formData, { // Pass formData as the second argument
           // contentType and uri are implicitly handled by FormData?
           upsert: true, // Overwrite if avatar already exists
        });

      if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        throw uploadError; // Re-throw the Supabase error
      }

      console.log("Upload successful via supabase-js. Path:", uploadData?.path);
      console.log("Fetching public URL...");
      
      // Use the path returned from the upload data if available
      const successfulPath = uploadData?.path || filePath;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(successfulPath);

      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        console.warn("Upload succeeded but failed to get public URL.");
        throw new Error("Failed to get avatar URL after upload.");
      }

      console.log("Public URL obtained:", publicUrl);
      console.log("Updating profile table...");

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile Update Error:", updateError);
        throw new Error("Failed to update profile with new avatar URL.");
      }

      console.log("Profile updated. Refreshing profile context...");

      // Refresh profile in context
      await refreshProfile();
      Alert.alert('Success', 'Profile picture updated!');

    } catch (error: any) {
      console.error("uploadAvatar error:", error);
      Alert.alert('Error', error.message || 'Failed to upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

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
    // Use ScrollView in case settings list grows
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* --- Profile Header Section --- */} 
      <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
              <Image 
                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('../../assets/images/default-avatar.png')}
                style={styles.avatarImage} 
              />
              {/* Edit Icon Overlay */} 
              <Pressable 
                style={({ pressed }) => [styles.editAvatarButton, pressed && styles.buttonPressed]} 
                onPress={handleChooseAvatar} 
                disabled={isUploading}
                hitSlop={10} // Increase tappable area
              >
                {isUploading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <Ionicons name="camera-outline" size={20} color={colors.white} />
                )}
              </Pressable>
          </View>
          <View style={styles.profileInfoContainer}>
              <Text style={styles.profileUsername} numberOfLines={1}>{profile?.username || 'Beardy User'}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || ''}</Text>
          </View>
      </View>

      {/* --- Settings List Section --- */} 
      <View style={styles.settingsListContainer}>
          {/* Example Read-only Item (can link to edit screen later) */} 
          <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Username</Text>
              <Text style={styles.settingValue}>{profile?.username || '-'}</Text>
          </View>
           <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.email || '-'}</Text>
          </View>

          {/* Placeholder for future settings */} 
          <Pressable style={styles.settingItem} onPress={() => Alert.alert('Coming Soon!', 'Password changing will be added later.')}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.greyMedium} />
          </Pressable>
          <Pressable style={styles.settingItem} onPress={() => Alert.alert('Coming Soon!', 'Notification settings will be added later.')}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.greyMedium} />
          </Pressable>
      </View>

      {/* --- Logout Button --- */} 
      <Pressable
        style={({ pressed }) => [styles.button, styles.logoutButton, pressed && styles.buttonPressed]}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
      
      {/* Spacer at bottom */} 
      <View style={{ height: 40 }} /> 

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
      flex: 1,
      backgroundColor: colors.background,
  },
  container: {
    // flex: 1, // Removed flex: 1 for ScrollView contentContainerStyle
    padding: spacing.lg,
    // paddingTop: spacing.xl, // Padding handled by header margin
  },
  header: {
      fontFamily: typography.fonts.header,
      fontSize: typography.fontSizes.h2,
      color: colors.textPrimary,
      fontWeight: typography.fontWeights.bold,
      marginBottom: spacing.lg, // Space below header
      textAlign: 'left', // Align header left now
  },
  // --- Profile Header Styles --- 
  profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xl, 
      paddingBottom: spacing.lg, // Add padding below the header content
      borderBottomWidth: 1, // Separator line
      borderBottomColor: colors.greyLight,
  },
  avatarContainer: {
      position: 'relative', // Needed for overlay button
      marginRight: spacing.md, // Space between avatar and text
  },
  avatarImage: { 
      width: 80, // Slightly smaller avatar
      height: 80,
      borderRadius: 40, // Circular
  },
  editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary, // Use primary color for button
      width: 32,
      height: 32,
      borderRadius: 16, // Circular
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2, // Add border to make it pop
      borderColor: colors.white, // White border
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 3,
  },
  profileInfoContainer: {
      flex: 1, // Allow text to take remaining space
      justifyContent: 'center',
  },
  profileUsername: {
      fontFamily: typography.fonts.header,
      fontSize: typography.fontSizes.h3,
      color: colors.textPrimary,
      fontWeight: typography.fontWeights.semiBold,
      marginBottom: spacing.xs,
  },
  profileEmail: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.md,
      color: colors.textSecondary,
  },
  // --- Settings List Styles --- 
  settingsListContainer: {
      backgroundColor: colors.white, // White background for the list section
      borderRadius: 12,
      borderWidth: 1, // Add border around the list
      borderColor: colors.greyLight,
      marginBottom: spacing.xl, // Space below the list
      overflow: 'hidden', // Clip items to rounded corners
  },
  settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg, // More vertical padding for easier tapping
      borderBottomWidth: 1,
      borderBottomColor: colors.greyLight,
  },
  // Remove border from the last item
  settingItemLast: {
      borderBottomWidth: 0,
  },
  settingLabel: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.md,
      color: colors.textPrimary,
  },
  settingValue: {
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.md,
      color: colors.textSecondary,
  },
  // --- Button Styles (Logout) --- 
  button: { 
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // marginTop: spacing.lg, // Margin handled by spacing of sections
  },
  logoutButton: { 
    backgroundColor: colors.white,
    borderColor: colors.error,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontFamily: typography.fonts.button,
    fontSize: typography.fontSizes.button,
    color: colors.error, 
    fontWeight: typography.fontWeights.bold,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  // Removed unused styles like userInfoContainer, changeButton, changeButtonText
});

export default SettingsScreen; 