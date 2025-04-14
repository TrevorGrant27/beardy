import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainAppStackParamList } from '../navigation/types';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import { supabase } from '../lib/supabase';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

// Define interface for Post Details (can reuse/adapt Feed's Post if needed)
interface PostDetail {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles: { username: string; } | null; // Expect profile to exist for a valid post
}

// Define interface for Comments
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { username: string; } | null; // Join profile for commenter username
}

// Define the route prop type
type PostDetailScreenRouteProp = RouteProp<MainAppStackParamList, 'PostDetail'>;

const PostDetailScreen = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const { postId } = route.params;
  const { user, profile } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- Fetch Post Details --- 
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            content,
            image_url,
            created_at,
            profiles ( username )
          `)
          .eq('id', postId)
          .single(); // Use .single() as we expect only one post

        if (postError) throw new Error(`Failed to load post: ${postError.message}`);
        if (!postData) throw new Error('Post not found.');
        
        // Handle profile mapping for post author
        const mappedPost = {
            ...postData,
            profiles: (postData.profiles && !Array.isArray(postData.profiles)) 
                      ? postData.profiles 
                      : null // Adjust if profiles structure differs with .single()
        } as PostDetail;
        setPost(mappedPost);

        // --- Fetch Comments --- 
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            id,
            post_id,
            user_id,
            content,
            created_at,
            profiles ( username )
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (commentsError) throw new Error(`Failed to load comments: ${commentsError.message}`);
        
        // Handle profile mapping for comments
        const mappedComments = (commentsData || []).map(c => ({
          ...c,
          profiles: (c.profiles && !Array.isArray(c.profiles)) 
                    ? c.profiles 
                    : null // Adjust if profiles structure differs
        })) as Comment[];
        setComments(mappedComments);

      } catch (err: any) {
        console.error("Error fetching post details or comments:", err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }

  }, [postId]); // Re-fetch if postId changes

  // --- Comment Submission Handler ---
  const handleCommentSubmit = async () => {
    if (!user || !profile) {
      Alert.alert("Login Required", "You need to be logged in to comment.");
      return;
    }
    if (!newCommentText.trim()) {
      Alert.alert("Empty Comment", "Please enter some text for your comment.");
      return;
    }

    setIsSubmittingComment(true);
    const commentContent = newCommentText.trim();
    setNewCommentText(''); // Clear input immediately
    Keyboard.dismiss();

    // Optimistic Update data structure
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, // Temporary ID for key
      post_id: postId,
      user_id: user.id,
      content: commentContent,
      created_at: new Date().toISOString(), // Current time
      profiles: { username: profile.username }, // Use current user's profile
    };

    // Add to state optimistically
    setComments(currentComments => [...currentComments, optimisticComment]);

    try {
      const { error: insertError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentContent,
        });

      if (insertError) {
        throw insertError;
      }
      console.log("Comment submitted successfully");
      // Optional: Could re-fetch comments here to get real ID/timestamp, 
      // but optimistic update handles immediate UI.
      // Consider removing the temp comment and adding the real one if needed.
      // For now, the optimistic one stays.

    } catch (err: any) {
      console.error("Error submitting comment:", err);
      Alert.alert("Error", "Failed to submit comment. Please try again.");
      // Revert optimistic update
      setComments(currentComments => currentComments.filter(c => c.id !== optimisticComment.id));
      setNewCommentText(commentContent); // Put text back in input
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // --- Render Functions ---
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <ThemedText weight="semiBold">{item.profiles?.username || 'Unknown User'}</ThemedText>
      <ThemedText style={styles.commentContent}>{item.content}</ThemedText>
      <ThemedText variant="caption" color="textSecondary" style={styles.commentTimestamp}>
        {new Date(item.created_at).toLocaleString()}
      </ThemedText>
    </View>
  );

  const renderHeader = () => {
    if (!post) return null;
    return (
        <View style={styles.postContainer}>
            <ThemedText weight="bold" size="lg">{post.profiles?.username || 'Unknown User'}</ThemedText>
            {/* TODO: Avatar */} 
            {post.image_url && <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover"/>}
            {post.content && <ThemedText style={styles.postContent}>{post.content}</ThemedText>}
            <ThemedText variant="caption" color="textSecondary" style={styles.timestamp}>
                {new Date(post.created_at).toLocaleString()}
            </ThemedText>
             {/* TODO: Add Like/Comment actions for the main post? */}
        </View>
    );
  };

  // --- Main Return ---
  if (loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
            <ThemedText variant="error">Error loading post:</ThemedText>
            <ThemedText color="error">{error}</ThemedText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!post) {
      // Should not happen if no error, but good practice
      return (
        <ScreenWrapper>
             <View style={styles.container}>
                 <ThemedText>Post not found.</ThemedText>
             </View>
        </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withScrollView={false} style={styles.screenWrapperStyle}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} 
      >
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={<ThemedText style={styles.noCommentsText}>No comments yet.</ThemedText>}
          contentContainerStyle={styles.listContentContainer}
        />

        {/* Comment Input Area */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={colors.greyMedium}
            value={newCommentText}
            onChangeText={setNewCommentText}
            multiline
            editable={!isSubmittingComment} // Disable while submitting
          />
          <TouchableOpacity 
            style={[styles.sendButton, isSubmittingComment && styles.sendButtonDisabled]}
            onPress={handleCommentSubmit} 
            disabled={isSubmittingComment}
          >
            <ThemedText weight="semiBold" style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screenWrapperStyle: {
    paddingHorizontal: spacing.md,
  },
  keyboardAvoidingView: { 
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  postContainer: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  postImage: {
    width: '100%',
    height: 250, // Adjust as needed
    borderRadius: 8,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  postContent: {
    fontSize: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 22, // Improve readability
  },
  timestamp: {
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  commentCard: {
    backgroundColor: colors.background, // Slightly different background for comments?
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight, // Separator for comments
  },
  commentContent: {
      marginTop: spacing.xs,
  },
  commentTimestamp: {
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  noCommentsText: {
      textAlign: 'center',
      marginTop: spacing.lg,
      color: colors.textSecondary,
  },
  placeholderText: { // Style might be reused for error/empty states
    marginTop: spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center', // Center placeholder/error text
  },
  commentInputContainer: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.greyLight,
    backgroundColor: colors.background, // Match screen background
    alignItems: 'center', // Align items vertically
  },
  commentInput: {
    flex: 1,
    minHeight: 40, // Ensure decent tap area
    maxHeight: 120, // Limit growth
    backgroundColor: colors.white, // Or a slightly off-white
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderColor: colors.greyMedium,
    borderWidth: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40, // Match min input height
  },
  sendButtonDisabled: {
      backgroundColor: colors.greyMedium,
  },
  sendButtonText: {
    color: colors.white,
  },
});

export default PostDetailScreen; 