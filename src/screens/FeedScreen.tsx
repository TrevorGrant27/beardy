import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity, // For potential interactions
  Alert,
  Image, // Ensure Image is imported
  Platform,
  Pressable, // <-- Import Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import an icon set
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import { supabase } from '../lib/supabase';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext'; // To potentially get current user for interactions
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Import useNavigation and useFocusEffect
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp
import { MainAppStackParamList } from '../navigation/types'; // Import MainAppStackParamList
import dayjs from 'dayjs'; // Import dayjs
import relativeTime from 'dayjs/plugin/relativeTime'; // Import relativeTime plugin

// Extend dayjs with the plugin
dayjs.extend(relativeTime);

const POSTS_PER_PAGE = 10; // Define how many posts to fetch per page

// Define the Post structure (including profile username)
interface Post {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
  // Include profile data fetched via join
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null; // Can be null if profile join fails or is optional
  // Add likes_count and comments_count if fetching them later
  like_count?: number; 
  comment_count?: number;
  user_has_liked?: boolean;
}

// Define the structure for the stats state
interface PostStats {
    likes: number;
    comments: number;
    liked: boolean;
}

// Define navigation prop type
type FeedScreenNavigationProp = StackNavigationProp<MainAppStackParamList, 'MainTabs'>;

const FeedScreen = () => {
  const navigation = useNavigation<FeedScreenNavigationProp>(); // Use typed navigation
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [loadingMore, setLoadingMore] = useState(false); // Loading next page
  const [hasMore, setHasMore] = useState(true); // Assume more pages initially
  const [currentPage, setCurrentPage] = useState(1); // Start at page 1
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [postStats, setPostStats] = useState<Record<string, PostStats>>({});
  const { user } = useAuth(); // Get user

  // Modified fetchPosts to handle pagination and append/replace data
  const fetchPosts = async (page: number, refreshing = false) => {
    console.log(`--- Fetching posts - Page: ${page}, Refreshing: ${refreshing} ---`);
    setError(null);
    if (page === 1) setLoading(true); // Only show full loader on first page load/refresh
    else setLoadingMore(true);

    try {
      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error: dbError } = await supabase
        .from('posts')
        .select('id, user_id, title, content, image_url, created_at, profiles ( username, avatar_url )')
        .order('created_at', { ascending: false })
        .range(from, to); // Use range for pagination

      if (dbError) throw dbError;

      if (data) {
        const fetchedPosts = data.map(p => ({
          id: p.id,
          user_id: p.user_id,
          title: p.title,
          content: p.content,
          image_url: p.image_url,
          created_at: p.created_at,
          profiles: p.profiles && typeof p.profiles === 'object' && !Array.isArray(p.profiles)
                      ? { username: (p.profiles as any).username, avatar_url: (p.profiles as any).avatar_url } 
                      : null,
        })) as Post[];

        // Append new posts or replace if refreshing
        setPosts(prevPosts => refreshing ? fetchedPosts : [...prevPosts, ...fetchedPosts]);

        // Check if there are more posts to load
        if (fetchedPosts.length < POSTS_PER_PAGE) {
          console.log('--- Reached end of posts --- ');
          setHasMore(false);
        }

        // Fetch stats for the newly added posts
        const newPostIds = fetchedPosts.map(p => p.id);
        if (newPostIds.length > 0) {
          fetchPostStats(newPostIds, user?.id, true); // Pass true to append stats
        }

      } else {
        if (page === 1) setPosts([]); // Clear posts if first page returns null
        setHasMore(false); // No data means no more posts
      }
    } catch (e: any) {
      console.error("Error fetching posts:", e);
      setError(e.message || 'Failed to load feed.');
      // Don't clear posts on error when loading more, keep existing ones
    } finally {
      if (page === 1) setLoading(false);
      setLoadingMore(false);
      setRefreshing(false); // Ensure refreshing is turned off
    }
  };

  // Modified fetchPostStats to optionally append to existing stats
  const fetchPostStats = async (postIds: string[], currentUserId: string | undefined, append: boolean = false) => {
    if (!postIds || postIds.length === 0) return;
    console.log(`Fetching stats for posts: [${postIds.join(', ')}] (Append: ${append})`);
    // No separate loading state for stats needed now, tied to post loading

    try {
      const statsToUpdate: Record<string, PostStats> = {};
      for (const postId of postIds) {
        let likes = 0;
        let comments = 0;
        let liked = false;
        // Fetch like count
        const { data: countData } = await supabase.rpc('get_post_like_count', { post_id_input: postId });
        if (typeof countData === 'number') likes = countData;
        // Fetch comment count
        const { data: commentCountData } = await supabase.rpc('get_post_comment_count', { post_id_input: postId });
        if (typeof commentCountData === 'number') comments = commentCountData;
        // Fetch user like status
        if (currentUserId) {
            const { data: likedData } = await supabase.rpc('user_has_liked_post', { post_id_input: postId, user_id_input: currentUserId });
            if (typeof likedData === 'boolean') liked = likedData;
        }
        statsToUpdate[postId] = { likes, comments, liked };
      }
      console.log("Fetched new stats:", statsToUpdate);
      // Update state by merging or replacing
      setPostStats(prevStats => append ? { ...prevStats, ...statsToUpdate } : statsToUpdate);
    } catch (error: any) {
      console.error("Error fetching post stats:", error);
    }
  };

  // Initial load effect using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      // Only fetch if posts are empty (avoids re-fetching on every focus)
      // Or potentially add logic to check if refresh is needed
      if (posts.length === 0) {
         console.log("--- Feed focused, no posts, triggering initial load --- ");
         setLoading(true); // Ensure loading is true before fetch
         setCurrentPage(1); // Reset to page 1
         setHasMore(true); // Assume more posts
         setPosts([]); // Clear posts before fetching page 1
         setPostStats({}); // Clear stats
         fetchPosts(1, true); // Fetch page 1, refreshing=true
      }
      return () => {
        // Optional cleanup
      };
    }, []) // Empty dependency array: runs once on initial focus
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true); // Assume more posts on refresh
    setCurrentPage(1); // Reset to page 1
    // Fetch page 1, replacing existing data
    // Pass refreshing=true to fetchPosts to handle state updates
    await fetchPosts(1, true);
    // Refreshing state is set to false inside fetchPosts finally block
  }, [user]); 

  // Load more handler
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) {
       console.log(`--- Load more skipped (loading=${loading}, loadingMore=${loadingMore}, hasMore=${hasMore}) ---`);
       return; // Don't load more if already loading or no more posts
    }
    console.log("--- Reached end, loading more --- ");
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage); // Fetch next page (append)
  };

  // --- Like Toggle Handler (Updated for new state structure) ---
  const handleLikeToggle = async (postId: string) => {
    if (!user) {
      Alert.alert("Login Required", "You need to be logged in to like posts.");
      return;
    }

    // Use postStats state
    const currentStats = postStats[postId] || { likes: 0, comments: 0, liked: false };
    const currentlyLiked = currentStats.liked;
    const newLikedStatus = !currentlyLiked;
    // Update likes count based on toggle
    const newLikeCount = currentlyLiked ? currentStats.likes - 1 : currentStats.likes + 1;

    // Optimistic UI Update for postStats
    setPostStats(prev => ({
      ...prev,
      // Keep existing comments count, update likes and liked status
      [postId]: { ...currentStats, likes: newLikeCount, liked: newLikedStatus }, 
    }));

    try {
      if (newLikedStatus) {
        // Like: Insert 
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      } else {
        // Unlike: Delete 
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      // Revert Optimistic Update on error
      setPostStats(prev => ({
        ...prev,
        [postId]: currentStats, // Revert to original stats
      }));
      Alert.alert("Error", "Could not update like status. Please try again.");
    }
  };

  // Render individual post item
  const renderPost = ({ item }: { item: Post }) => {
    const stats = postStats[item.id] || { likes: 0, comments: 0, liked: false };
    
    const goToPostDetail = () => {
      navigation.navigate('PostDetail', { postId: item.id });
    };

    return (
      // Overall container for the card with margins
      <View style={styles.postOuterContainer}>
        {/* Make the main content area tappable, excluding actions */}
        <TouchableOpacity 
          style={styles.postTouchableArea}
          onPress={goToPostDetail} 
          activeOpacity={0.7} // Slightly less dimming on tap
        >
          {/* Post Header (Avatar, Username, Timestamp) */}
          <View style={styles.postHeader}>
            {/* Avatar Image */}
            <Image 
              source={item.profiles?.avatar_url ? { uri: item.profiles.avatar_url } : require('../../assets/images/default-avatar.png')} // Use default if no URL
              style={styles.avatarImage} 
            />
            {/* Text Content */}
            <View style={styles.postHeaderTextContainer}>
              <ThemedText style={styles.postUsername}>
                {item.profiles?.username || 'User'} 
              </ThemedText>
              <ThemedText style={styles.postTimestamp}>
                {dayjs(item.created_at).fromNow()} 
              </ThemedText>
            </View>
          </View>

          {/* Post Title */} 
          {item.title && (
            // No need for separate TouchableOpacity if main area is tappable
            <ThemedText style={styles.postTitle}>{item.title}</ThemedText>
          )}

          {/* Post Content Snippet */} 
          {item.content && (
            <ThemedText 
                style={styles.postContent} // Use base content style
                numberOfLines={item.image_url ? 3 : 6} // Show fewer lines if image follows
            >
              {item.content}
            </ThemedText>
          )}
          
          {/* Post Image */} 
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
          )}

          {/* Post Actions (Likes, Comments) - Now INSIDE the tappable area */}
          <View style={styles.actionsContainer}>
            {/* Like Button */} 
            <Pressable // <-- Use Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed // Optional: add pressed style
              ]}
              onPress={() => handleLikeToggle(item.id)} 
              disabled={!user}
              // No propagation logic needed with Pressable usually
            >
              <Ionicons
                name={stats.liked ? 'heart' : 'heart-outline'}
                size={24}
                color={stats.liked ? colors.error : colors.textSecondary}
              />
              {/* Always render Text, conditionally render number inside */}
              <ThemedText style={styles.actionText}>
                {stats.likes > 0 ? stats.likes : ''} 
              </ThemedText>
            </Pressable>

            {/* Comment Button */} 
            <Pressable // <-- Use Pressable
               style={({ pressed }) => [
                 styles.actionButton,
                 pressed && styles.actionButtonPressed // Optional: add pressed style
               ]}
              onPress={goToPostDetail} // Still navigates for now
              // No propagation logic needed with Pressable usually
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
              {/* Always render Text, conditionally render number inside */}
              <ThemedText style={styles.actionText}>
                {stats.comments > 0 ? stats.comments : ''}
              </ThemedText>
            </Pressable>
            {/* Add Share button etc. if needed */} 
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // --- Render Footer (Loading Indicator) --- 
  const renderFooter = () => {
    if (!loadingMore) return null; // Don't render if not loading more
    return (
      <View style={styles.footerLoadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // --- Handle Create Post Navigation ---
  const handleCreatePost = () => {
    // navigation.navigate('MainAppStack', { screen: 'CreatePost' });
    // Navigate directly to the screen within the current MainAppStack
    navigation.navigate('CreatePost'); 
  };

  // --- Loading State (Initial Load) --- 
  if (loading && currentPage === 1) {
    // Show skeleton loader for initial load only
    return (
       <ScreenWrapper withScrollView={false} style={styles.screenWrapperStyle}>
          {/* Render multiple skeletons for initial view */}
          <PostDetailSkeleton /> 
          <PostDetailSkeleton />
          <PostDetailSkeleton />
       </ScreenWrapper>
    );
  }

  // --- Error State --- 
  if (error && posts.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <ThemedText variant="error">Error loading feed:</ThemedText>
          <ThemedText color="error">{error}</ThemedText>
          {/* Add a retry button? */}
        </View>
      </ScreenWrapper>
    );
  }

  // --- Main Return --- 
  return (
    <ScreenWrapper withScrollView={false}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        refreshControl={ // Add RefreshControl
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Spinner color
            tintColor={colors.primary} // Spinner color for iOS
          />
        }
        onEndReached={handleLoadMore} // Trigger load more
        onEndReachedThreshold={0.5} // How far from the end (0.5 means 50% of visible length)
        ListFooterComponent={renderFooter} // Show loading indicator at bottom
        ListEmptyComponent={() => ( // Show if not loading and posts are empty
          !loading && !refreshing && (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Nothing in the feed yet!</ThemedText>
              <ThemedText style={styles.emptyText}>Be the first to post.</ThemedText>
            </View>
          )
        )}
      />
      {/* FAB might need adjustment if overlapping footer loader */} 
      <Pressable style={styles.fab} onPress={handleCreatePost}>
        <Ionicons name="add" size={30} color={colors.white} />
      </Pressable>
    </ScreenWrapper>
  );
};

// --- Basic Skeleton Component Definitions (Copied from PostDetailScreen) ---
const SkeletonElement = ({ style }: { style: any }) => <View style={[styles.skeletonBase, style]} />;

const PostDetailSkeleton = () => (
  <View style={styles.postContainerSkeleton}> {/* Use a slightly different style key */}
    {/* Author Header Skeleton */}
    <View style={styles.postHeader}>
      <SkeletonElement style={styles.avatarImage} />
      <View style={styles.postHeaderTextContainer}>
        <SkeletonElement style={{ width: '60%', height: 16, marginBottom: 4 }} />
        <SkeletonElement style={{ width: '40%', height: 12 }} />
      </View>
    </View>
    {/* Title Skeleton */}
    <SkeletonElement style={{ width: '80%', height: 24, marginBottom: spacing.md }} />
    {/* Content Skeleton */}
    <SkeletonElement style={{ width: '100%', height: 18, marginBottom: 6 }} />
    <SkeletonElement style={{ width: '90%', height: 18, marginBottom: spacing.lg }} />
    {/* Actions Skeleton */}
    <View style={styles.actionsContainerSkeleton}> {/* Use a slightly different style key */}
      <SkeletonElement style={{ width: 50, height: 24, marginRight: spacing.lg }} />
      <SkeletonElement style={{ width: 50, height: 24 }} />
    </View>
  </View>
);

// Add styles needed for Skeleton
const styles = StyleSheet.create({
  screenWrapperStyle: { flex: 1 }, // Example existing
  list: { flex: 1 }, // Example existing
  listContentContainer: { paddingTop: spacing.sm, paddingBottom: spacing.lg + 70 }, // Example existing
  postOuterContainer: { marginBottom: spacing.lg }, // Example existing
  postTouchableArea: { backgroundColor: colors.cardBackground, borderRadius: 12, padding: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: Platform.OS === 'ios' ? 0 : 1, borderColor: colors.greyLight }, // Example existing
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }, // Example existing
  avatarImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.greyLight, marginRight: spacing.sm }, // Example existing
  postHeaderTextContainer: { flex: 1 }, // Example existing
  postUsername: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semiBold as any, color: colors.textPrimary }, // Example existing
  postTimestamp: { fontSize: typography.fontSizes.xs, color: colors.textSecondary }, // Example existing
  postTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold as any, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.xs }, // Example existing
  postContent: { fontSize: typography.fontSizes.md, lineHeight: typography.fontSizes.md * 1.4, color: colors.textSecondary, marginBottom: spacing.md }, // Example existing
  postImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.greyLight }, // Example existing
  actionsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.greyLight, paddingTop: spacing.md }, // Example existing
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg }, // Example existing
  actionButtonPressed: { opacity: 0.6 }, // Example existing
  actionText: { marginLeft: spacing.xs, fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: typography.fontWeights.medium as any }, // Example existing
  fab: { position: 'absolute', bottom: spacing.lg + 20, right: spacing.lg, backgroundColor: colors.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }, // Example existing
  fabIcon: { fontSize: 30, color: colors.white, lineHeight: 30 }, // Example existing - Adjust if using Ionicons now
  footerLoadingContainer: { paddingVertical: spacing.md, alignItems: 'center' }, // Example existing
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }, // Example existing
  emptyContainer: { paddingVertical: spacing.xl * 2, alignItems: 'center' }, // Example existing
  emptyText: { marginBottom: spacing.md, color: colors.textSecondary }, // Example existing
  // --- Skeleton Styles --- 
  skeletonBase: {
      backgroundColor: colors.greyLight + 'A0', // Slightly transparent grey
      borderRadius: 4,
  },
  postContainerSkeleton: { // Style for the skeleton container
      backgroundColor: colors.white, // Match card background maybe?
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.lg,
      opacity: 0.7, // Make skeleton slightly transparent
  },
  actionsContainerSkeleton: { // Style for skeleton actions
      flexDirection: 'row',
      marginTop: spacing.md, 
      borderTopWidth: 1,
      borderTopColor: colors.greyLight + '80',
      paddingTop: spacing.md,
  },
});

export default FeedScreen; 