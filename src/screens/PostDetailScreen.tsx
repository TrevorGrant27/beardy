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
  Pressable,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainAppStackParamList } from '../navigation/types';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Extend dayjs with the plugin
dayjs.extend(relativeTime);

// Define interface for Post Details
interface PostDetail {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
  profiles: { 
      username: string; 
      avatar_url: string | null;
  } | null;
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

// Define the structure for the stats state (copied from FeedScreen)
interface PostStats {
    likes: number;
    comments: number;
    liked: boolean;
}

// Define the route prop type
type PostDetailScreenRouteProp = RouteProp<MainAppStackParamList, 'PostDetail'>;

const PostDetailScreen = () => {
  const route = useRoute<PostDetailScreenRouteProp>();
  const { postId } = route.params;
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [postStats, setPostStats] = useState<PostStats>({ likes: 0, comments: 0, liked: false });
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Fetch Post Stats function (adapted from FeedScreen) ---
  const fetchPostStats = async (postIdToFetch: string, currentUserId: string | undefined) => {
    setLoadingStats(true);
    console.log(`Fetching stats for single post: ${postIdToFetch}`);
    try {
      let likes = 0;
      let comments = 0;
      let liked = false;

      // Use specific functions if available, otherwise adapt general ones
      const { data: countData, error: countError } = await supabase.rpc('get_post_like_count', { post_id_input: postIdToFetch });
      if (countError) console.warn(`Error fetching like count for post ${postIdToFetch}:`, countError.message);
      else if (typeof countData === 'number') likes = countData;

      const { data: commentCountData, error: commentCountError } = await supabase.rpc('get_post_comment_count', { post_id_input: postIdToFetch });
      if (commentCountError) console.warn(`Error fetching comment count for post ${postIdToFetch}:`, commentCountError.message);
      else if (typeof commentCountData === 'number') comments = commentCountData;

      if (currentUserId) {
          const { data: likedData, error: likedError } = await supabase.rpc('user_has_liked_post', { post_id_input: postIdToFetch, user_id_input: currentUserId });
          if (likedError) console.warn(`Error fetching user like status for post ${postIdToFetch}:`, likedError.message);
          else if (typeof likedData === 'boolean') liked = likedData;
      }

      setPostStats({ likes, comments, liked });
      console.log("Fetched post stats:", { likes, comments, liked });
    } catch (error: any) {
      console.error("Error fetching post stats:", error);
      // Optionally set an error state for stats
    } finally {
        setLoadingStats(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingStats(true);
      setError(null);
      try {
        // --- Fetch Post Details --- 
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            title,
            content,
            image_url,
            created_at,
            profiles ( username, avatar_url )
          `)
          .eq('id', postId)
          .single();

        if (postError) throw new Error(`Failed to load post: ${postError.message}`);
        if (!postData) throw new Error('Post not found.');
        
        // Adjust profile mapping if needed (should be okay with single())
        const mappedPost = {
            ...postData,
            profiles: (postData.profiles && !Array.isArray(postData.profiles)) 
                      ? postData.profiles 
                      : null 
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
        
        const mappedComments = (commentsData || []).map(c => ({
          ...c,
          profiles: (c.profiles && !Array.isArray(c.profiles)) 
                    ? c.profiles 
                    : null 
        })) as Comment[];
        setComments(mappedComments);

        // --- Fetch Post Stats (after main data is loaded) --- 
        await fetchPostStats(postId, user?.id);

      } catch (err: any) {
        console.error("Error fetching post details/comments/stats:", err);
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchData();
    }

  }, [postId, user]);

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
    setNewCommentText('');
    Keyboard.dismiss();

    // Optimistic Update data structure
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      content: commentContent,
      created_at: new Date().toISOString(),
      profiles: { username: profile.username },
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
      // Increment comment count in stats state
      setPostStats(prev => ({ ...prev, comments: prev.comments + 1 }));

    } catch (err: any) {
      console.error("Error submitting comment:", err);
      Alert.alert("Error", "Failed to submit comment. Please try again.");
      // Revert optimistic update
      setComments(currentComments => currentComments.filter(c => c.id !== optimisticComment.id));
      setNewCommentText(commentContent);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // --- Like Toggle Handler (adapted from FeedScreen) ---
  const handleLikeToggle = async () => {
    if (!user) {
      Alert.alert("Login Required", "You need to be logged in to like posts.");
      return;
    }
    if (!post) return;

    const currentlyLiked = postStats.liked;
    const newLikedStatus = !currentlyLiked;
    const newLikeCount = currentlyLiked ? postStats.likes - 1 : postStats.likes + 1;

    // Optimistic UI Update
    setPostStats(prev => ({ ...prev, likes: newLikeCount, liked: newLikedStatus }));

    try {
      if (newLikedStatus) {
        const { error } = await supabase.from('likes').insert({ user_id: user.id, post_id: post.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('likes').delete().match({ user_id: user.id, post_id: post.id });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      Alert.alert("Error", "Could not update like status.");
      // Revert optimistic update on error
      setPostStats(prev => ({ ...prev, likes: currentlyLiked ? newLikeCount + 1 : newLikeCount -1, liked: currentlyLiked }));
    }
  };

  // --- Render Functions ---
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <ThemedText style={styles.commentUsername}>{item.profiles?.username || 'User'}</ThemedText>
        <ThemedText style={styles.commentTimestamp}>{dayjs(item.created_at).fromNow()}</ThemedText>
      </View>
      <ThemedText style={styles.commentContent}>{item.content}</ThemedText>
    </View>
  );

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
          style={styles.list}
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={() => (
            <View style={styles.postContainer}>
              <View style={styles.postAuthorHeader}>
                <Image 
                  source={post.profiles?.avatar_url ? { uri: post.profiles.avatar_url } : require('../../assets/images/default-avatar.png')}
                  style={styles.avatarImage} 
                />
                <View style={styles.postAuthorInfo}>
                  <ThemedText style={styles.postUsername}>{post.profiles?.username || 'User'}</ThemedText>
                  <ThemedText style={styles.postTimestamp}>{dayjs(post.created_at).fromNow()}</ThemedText>
                </View>
              </View>

              {post.title && (
                <ThemedText style={styles.postTitle}>{post.title}</ThemedText>
              )}

              {post.content && (
                <ThemedText style={styles.postContent}>{post.content}</ThemedText>
              )}
              
              {post.image_url && (
                <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
              )}

              <View style={styles.actionsContainer}>
                <Pressable style={styles.actionButton} onPress={handleLikeToggle} disabled={!user || loadingStats}>
                  <Ionicons
                    name={postStats.liked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={postStats.liked ? colors.error : colors.textSecondary}
                  />
                  {postStats.likes > 0 && (
                    <ThemedText style={styles.actionText}>{postStats.likes}</ThemedText>
                  )}
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => { /* Maybe focus input? */ }}>
                  <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
                  {postStats.comments > 0 && (
                     <ThemedText style={styles.actionText}>{postStats.comments}</ThemedText>
                  )}
                </Pressable>
              </View>

              <ThemedText style={styles.commentsHeader}>Comments</ThemedText>
            </View>
          )}
          ListEmptyComponent={() => (
            !loading && (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No comments yet.</ThemedText>
              </View>
            )
          )}
        />

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={styles.textInput}
            value={newCommentText}
            onChangeText={setNewCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, isSubmittingComment && styles.sendButtonDisabled]}
            onPress={handleCommentSubmit}
            disabled={isSubmittingComment || !newCommentText.trim()}
          >
            {isSubmittingComment ? 
              <ActivityIndicator size="small" color={colors.white} /> :
              <Ionicons name="send" size={20} color={colors.white} />
            }
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
  list: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  listContentContainer: {
    paddingBottom: spacing.xl,
  },
  postContainer: {
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  postAuthorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
  },
  avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.sm,
      backgroundColor: colors.greyLight,
  },
  postAuthorInfo: {
      flex: 1,
  },
  postUsername: {
      fontSize: typography.fontSizes.md,
      fontWeight: typography.fontWeights.semiBold,
      color: colors.textPrimary,
  },
  postTimestamp: {
      fontSize: typography.fontSizes.xs,
      color: colors.textSecondary,
  },
  postTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  postContent: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.fontSizes.md * 1.5,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  postImage: {
    width: '100%',
    aspectRatio: 16 / 9, 
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.greyLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  commentsHeader: {
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      color: colors.textPrimary,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
  },
  commentCard: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
  },
  commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
  },
  commentUsername: {
      fontSize: typography.fontSizes.sm,
      fontWeight: typography.fontWeights.semiBold,
      color: colors.textPrimary,
  },
  commentTimestamp: {
      fontSize: typography.fontSizes.xs,
      color: colors.textSecondary,
  },
  commentContent: {
    fontSize: typography.fontSizes.md,
    lineHeight: typography.fontSizes.md * 1.4,
    color: colors.textPrimary,
  },
  emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
  },
  emptyText: {
      color: colors.textSecondary,
      fontSize: typography.fontSizes.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.greyLight,
    backgroundColor: colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderColor: colors.greyLight,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    lineHeight: typography.fontSizes.md * 1.3,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.sm + 2,
    marginLeft: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
      backgroundColor: colors.greyMedium,
  },
});

export default PostDetailScreen; 