import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Button,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainAppStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase'; // Import Supabase client
import { useAuth } from '../context/AuthContext'; // Import useAuth

type CreatePostNavigationProp = StackNavigationProp<MainAppStackParamList, 'CreatePost'>;

// Helper function to extract file extension (simplified)
const getFileExtension = (uri: string): string => {
  const match = uri.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
  return match ? match[1] : 'jpg'; // Default to jpg if extraction fails
};

const CreatePostScreen = () => {
  const navigation = useNavigation<CreatePostNavigationProp>();
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<ImagePicker.PermissionStatus | null>(null);
  const { user } = useAuth(); // Get user from context

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

    if (!postText && !selectedImage) {
      Alert.alert("Empty Post", "Please add text or an image to your post.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | null = null;
    let uploadError = null;

    try {
      // --- Upload Image if selected --- 
      if (selectedImage) {
        const fileExt = getFileExtension(selectedImage);
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log(`Uploading image: ${filePath}`);

        // Fetch the image data as a blob
        const response = await fetch(selectedImage);
        const blob = await response.blob();

        // Check blob type and size (optional)
        console.log("Blob type:", blob.type, "Blob size:", blob.size);

        // Upload to Supabase Storage
        const { data: uploadData, error: storageError } = await supabase.storage
          .from('post-images') // Ensure this bucket name matches your Supabase setup
          .upload(filePath, blob, {
            contentType: blob.type || `image/${fileExt}`, // Use detected blob type or fallback
            upsert: false, // Don't overwrite existing files (though unlikely with timestamp)
          });

        if (storageError) {
          throw new Error(`Storage Error: ${storageError.message}`);
        }

        console.log("Upload successful:", uploadData);

        // Get Public URL
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) {
             console.warn("Could not get public URL for path:", filePath); // Log warning but maybe proceed?
             // Depending on RLS, maybe the URL isn't needed if accessed via signed URLs later?
             // For now, let's treat not getting a URL as potentially problematic but maybe not fatal
             // If your RLS allows public reads, this definitely shouldn't fail.
             // imageUrl = null; // Or throw an error? Let's try assigning anyway
        }
        imageUrl = urlData.publicUrl;
         console.log("Public URL:", imageUrl);
      }

      // --- Insert Post into Database --- 
      const postData = {
        user_id: user.id,
        content: postText || null, // Use null if text is empty
        image_url: imageUrl, // Use the URL obtained from storage (or null)
      };

      console.log("Inserting post data:", postData);

      const { error: insertError } = await supabase
        .from('posts')
        .insert([postData]);

      if (insertError) {
        throw new Error(`Database Error: ${insertError.message}`);
      }

      console.log("Post inserted successfully");
      Alert.alert("Success", "Your post has been published!");
      navigation.goBack(); // Navigate back to the feed

    } catch (error: any) {
      console.error("Error submitting post:", error);
      uploadError = error; // Store error to show in alert
      Alert.alert("Error", `Failed to submit post: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText variant="header" size="h2" style={styles.title}>Create New Post</ThemedText>

        <TextInput
          style={styles.textInput}
          placeholder="What's happening with your beardie?"
          placeholderTextColor={colors.greyMedium}
          value={postText}
          onChangeText={setPostText}
          multiline
        />

        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <Button title="Remove Image" onPress={() => setSelectedImage(null)} color={colors.error} />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Add Photo" onPress={handleChoosePhoto} disabled={isSubmitting} />
          <Button title={isSubmitting ? "Posting..." : "Post"} onPress={handleSubmitPost} disabled={isSubmitting} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 100,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16, // Adjust as needed
    color: colors.textPrimary,
    textAlignVertical: 'top', // Align text to top for multiline
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 200, // Adjust height as needed
    borderRadius: 8,
    marginBottom: spacing.md,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
});

export default CreatePostScreen; 