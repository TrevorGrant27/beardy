import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainAppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase'; // Import Supabase client
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env'; // Import Supabase creds from env
import { Session } from '@supabase/supabase-js'; // Import Session type

type CreatePostNavigationProp = StackNavigationProp<MainAppStackParamList, 'CreatePost'>;

// Helper function to extract file extension (simplified)
const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  return match ? match[1] : 'jpg'; // Default to jpg if extraction fails
};

const CreatePostScreen = () => {
  const navigation = useNavigation<CreatePostNavigationProp>();
  const { user, clearOnboardingPrompt } = useAuth(); // Get user and clear onboarding prompt
  const [postTitle, setPostTitle] = useState('');
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<ImagePicker.PermissionStatus | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaLibraryPermission(status);
      if (status !== 'granted') {
        // Optional: Alert here or wait until user tries to pick photo
        // Alert.alert('Permission Required', 'We need permission to access your photos to add one to your post.');
      }
    })();
  }, []);

  const handleChoosePhoto = async () => {
    let currentStatus = mediaLibraryPermission;
    if (currentStatus !== 'granted') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaLibraryPermission(status);
      currentStatus = status;
    }

    if (currentStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access in your device settings to add photos.'
      );
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      } 
    } catch (error) {
        console.error("ImagePicker Error: ", error);
        Alert.alert("Image Error", "Could not select image. Please try again.");
    }
  };

  const handleSubmitPost = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to post.");
      return;
    }

    // Enforce DB constraint: Must have content OR image, even if title is present
    if (!postText && !selectedImage) { 
      Alert.alert("Missing Content", "Please add text or an image to your post, even if it has a title.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | null = null;
    let uploadSuccessful = false;
    let session: Session | null = null;

    try {
      // Get current session token for Authorization
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        throw new Error(sessionError?.message || "Could not get user session.");
      }
      session = sessionData.session;

      // --- Upload Image using fetch and FormData --- 
      if (selectedImage) {
        const fileExt = getFileExtension(selectedImage);
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const contentType = `image/${fileExt}`;

        // Construct the Storage API endpoint URL
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/post-images/${filePath}`;
        console.log("Storage Upload URL:", uploadUrl);

        // Create FormData
        const formData = new FormData();
        // Append the file using the required structure for fetch to handle file URI
        formData.append('file', {
          uri: selectedImage, // The file:// URI
          name: fileName,    // The desired file name
          type: contentType, // The MIME type
        } as any); // Cast to any to satisfy FormData append type if needed

        console.log("Attempting upload via fetch with FormData...");

        // Make the fetch request with the USER'S access token
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY, // Still need API key
            Authorization: `Bearer ${session.access_token}`, // Use user's token
          },
          body: formData,
        });

        console.log("Fetch Response Status:", response.status);
        const responseBody = await response.json(); // Get response body for details
        console.log("Fetch Response Body:", responseBody);

        if (!response.ok) {
          // Throw an error with details from Supabase if available
          throw new Error(`Storage Upload Error (${response.status}): ${responseBody.message || 'Failed to upload image'}`);
        }
        
        uploadSuccessful = true; // Mark upload as successful
        console.log("Fetch FormData upload successful.");

        // --- Get Public URL (use Supabase client helper) --- 
        console.log("Attempting to get public URL for path:", filePath);
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);
        console.log("Public URL data received:", urlData);
        imageUrl = urlData?.publicUrl;
        console.log("Assigned Image URL:", imageUrl);

        if (!imageUrl) {
            console.warn("Failed to get public URL even after successful upload. Check bucket permissions/setup.");
        }
      }

      // --- Insert Post into Database --- 
      // (Only proceed if image upload was not attempted or was successful)
      if (uploadSuccessful || !selectedImage) {
          const postData = {
            user_id: user.id,
            title: postTitle || null,
            content: postText || null,
            image_url: imageUrl,
          };
          console.log("Attempting to insert post data:", postData);
          const { error: insertError } = await supabase
            .from('posts')
            .insert([postData]);
          
          if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            throw new Error(`Database Error: ${insertError.message}`);
          }
          console.log("Post insert successful.");
          // Show success alert and clear onboarding prompt when user confirms
          Alert.alert(
            "Success", 
            "Your post has been published!", 
            [
              { text: 'OK', onPress: () => clearOnboardingPrompt() }
            ],
            { cancelable: false }
          );
      } else {
           // This case should ideally be caught by the fetch error handling
           throw new Error("Image upload failed, post not created.");
      }

    } catch (error: any) {
      console.error("handleSubmitPost caught error:", error);
      Alert.alert("Error", `Failed to submit post: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper withScrollView={false}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <ThemedText variant="header" size="h2" style={styles.title}>Create New Post</ThemedText>

          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={postTitle}
            onChangeText={setPostTitle}
            maxLength={150}
          />

          <TextInput
            style={styles.textInput}
            placeholder="What's happening with your beardie?"
            placeholderTextColor={colors.textSecondary}
            value={postText}
            onChangeText={setPostText}
            multiline
          />

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => setSelectedImage(null)}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle" size={30} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button 
              title="Add Photo" 
              onPress={handleChoosePhoto} 
              disabled={isSubmitting} 
              style={[styles.actionButton, styles.secondaryButton]}
              textStyle={styles.secondaryButtonText}
            />
            <View style={styles.spacer} />
            <Button 
              title={isSubmitting ? "Posting..." : "Post"} 
              onPress={handleSubmitPost} 
              disabled={isSubmitting}
              style={[styles.actionButton, styles.primaryButton]}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  titleInput: {
    height: 50,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.textPrimary,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 1.41,
    elevation: 2,
  },
  textInput: {
    minHeight: 120,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 1.41,
    elevation: 2,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  imagePreview: {
    width: 300,
    height: 225,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.greyLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  spacer: {
    width: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
  },
});

export default CreatePostScreen; 