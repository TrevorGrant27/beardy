import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

// Helper (reuse or move to utils)
const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  return match ? match[1] : null;
};

// Correct the type to use RootStackParamList as AddBeardieInfo is now in the RootStack
type AddBeardieInfoScreenNavigationProp = StackNavigationProp<
  RootStackParamList, 
  'AddBeardieInfo' 
>;

// Define the route prop type
type AddBeardieInfoScreenRouteProp = RouteProp<RootStackParamList, 'AddBeardieInfo'>;

const AddBeardieInfoScreen: React.FC = () => {
  // Get navigation and route using hooks
  const navigation = useNavigation<AddBeardieInfoScreenNavigationProp>();
  const route = useRoute<AddBeardieInfoScreenRouteProp>();
  const { user, refreshBeardie, clearOnboardingPrompt } = useAuth();
  const [name, setName] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to add a picture.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Image Error', 'Could not select image.');
    }
  };

  const handleSave = async () => {
    if (!user) {
        Alert.alert('Error', 'User not found.');
        return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your beardie.');
      return;
    }

    setIsSaving(true);
    let photoUrl: string | null = null;

    try {
      // 1. Upload photo if selected
      if (selectedImageUri) {
        setIsUploading(true);
        const fileExt = getFileExtension(selectedImageUri);
        if (!fileExt) throw new Error('Could not determine file type.');
        const fileName = `profile.${fileExt}`;
        // Path: beardie_photos/{user_id}/{beardie_id}/profile.ext - Needs beardie ID first?
        // Alternative: store in user folder like avatar? user_id/beardie_profile.ext
        // Let's use user folder for simplicity for now
        const filePath = `${user.id}/beardie_profile.${fileExt}`; 
        const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

        const formData = new FormData();
        formData.append('file', { 
            uri: selectedImageUri, 
            name: fileName, 
            type: contentType 
        } as any);

        // Upload to a general 'beardie-profiles' bucket?
        const { error: uploadError } = await supabase.storage
            .from('beardie-profiles') // NEW BUCKET NEEDED
            .upload(filePath, formData, { upsert: true });
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('beardie-profiles')
            .getPublicUrl(filePath);
        photoUrl = urlData?.publicUrl;
        setIsUploading(false);
        if (!photoUrl) console.warn('Upload succeeded but failed to get URL');
      }

      // 2. Insert beardie data into the table
      const { error: insertError } = await supabase.from('beardies').insert({
        user_id: user.id,
        name: name.trim(),
        profile_photo_url: photoUrl,
        // dob, sex can be added later
      });

      if (insertError) throw insertError;

      // 3. Refresh context and navigate
      await refreshBeardie(); // Update context state
      navigateToNext(); // Navigate based on context

    } catch (error: any) {
      console.error("Error saving beardie:", error);
      Alert.alert('Error', `Failed to save beardie: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  const navigateToNext = () => {
    // Get the root navigator to perform the reset
    const rootNav = navigation.getParent() as StackNavigationProp<RootStackParamList> | undefined;

    // Check the route parameter to determine navigation behavior
    if (route.params?.presentedModally) {
        console.log("AddBeardieInfo: Going back (modal dismiss)");
        navigation.goBack();
    } else {
        // Onboarding flow: Clear the prompt and reset to the main app (Feed screen)
        console.log("AddBeardieInfo: Onboarding complete. Clearing prompt and resetting to MainAppStack/Feed.");
        clearOnboardingPrompt(); // Mark onboarding as complete
        rootNav?.reset({ 
            index: 0,
            routes: [
                { 
                    name: 'MainAppStack', 
                    params: { 
                        screen: 'MainTabs', 
                        params: { screen: 'Feed' } 
                    } 
                }
            ]
        });
    }
  };

  const handleSkip = () => {
    // Just navigate to the next step or go back
    navigateToNext();
  };

  const isLoading = isSaving || isUploading;

  return (
    <ScreenWrapper withScrollView>
      <View style={styles.container}>
        <ThemedText variant="header" size="h2" style={styles.title}>
          Tell us about your Beardie!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          You can add more details later.
        </ThemedText>

        {/* Avatar Picker */} 
        <TouchableOpacity style={styles.avatarPicker} onPress={handleChoosePhoto} disabled={isLoading}>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={40} color={colors.greyMedium} />
              <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
            </View>
          )}
           {isUploading && <ActivityIndicator style={styles.uploadIndicator} color={colors.primary}/>} 
        </TouchableOpacity>

        {/* Name Input */} 
        <TextInput
          style={styles.input}
          placeholder="Beardie's Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!isLoading}
        />

        {/* Action Buttons */} 
        <View style={styles.buttonContainer}>
            <Button 
                title={isSaving ? "Saving..." : "Save & Continue"} 
                onPress={handleSave} 
                disabled={isLoading || !name.trim()} // Disable if loading or no name
                style={styles.saveButton} 
            />
             <TouchableOpacity onPress={handleSkip} disabled={isLoading} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
      color: colors.textSecondary,
      marginBottom: spacing.xl,
      textAlign: 'center',
  },
  avatarPicker: {
    marginBottom: spacing.lg,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.greyLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // For indicator
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  avatarPlaceholderText: {
      marginTop: spacing.xs,
      fontSize: typography.fontSizes.sm,
      color: colors.greyMedium,
  },
  uploadIndicator: {
      position: 'absolute',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    fontSize: typography.fontSizes.lg,
    color: colors.textPrimary,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
      width: '100%',
      marginBottom: spacing.sm,
  },
  skipButton: {
      padding: spacing.sm,
  },
  skipButtonText: {
      color: colors.textSecondary,
      fontSize: typography.fontSizes.md,
      textDecorationLine: 'underline',
  },
});

export default AddBeardieInfoScreen; 