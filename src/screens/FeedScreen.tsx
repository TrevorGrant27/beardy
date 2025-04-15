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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import an icon set
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import { supabase } from '../lib/supabase';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext'; // To potentially get current user for interactions
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Import useNavigation and useFocusEffect
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp
import { MainAppStackParamList } from '../navigation/types'; // Import MainAppStackParamList
import dayjs from 'dayjs'; // Import dayjs
import relativeTime from 'dayjs/plugin/relativeTime'; // Import relativeTime plugin

// Extend dayjs with the plugin
dayjs.extend(relativeTime);

// Define the Post structure (including profile username)
interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  // Include profile data fetched via join
  profiles: {
    username: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [postStats, setPostStats] = useState<Record<string, PostStats>>({});
  const { user } = useAuth(); // Get user

  const fetchPosts = async () => {
    setError(null); // Clear previous errors
    try {
      // Fetch posts and join with profiles table to get username
      const { data, error: dbError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          profiles ( username ) 
        `)
        .order('created_at', { ascending: false })
        .limit(20); // Limit initial fetch

      if (dbError) {
        throw dbError;
      }

      // --- LOG RAW DATA --- 
      console.log("Raw Supabase data received:", JSON.stringify(data, null, 2)); 
      if (data && data.length > 0) {
          console.log("Profiles field for first post:", data[0].profiles);
      }
      // --- END LOG --- 

      if (data) {
        // Map the data correctly - Supabase returns the joined profile as an object here
        const fetchedPosts = data.map(p => {
          // Directly assign the profiles object if it exists, otherwise null
          const mappedProfile = p.profiles && typeof p.profiles === 'object' && !Array.isArray(p.profiles)
                               ? { username: (p.profiles as any).username } // Access username, cast to any if TS complains
                               : null;

          return {
            id: p.id,
            user_id: p.user_id,
            content: p.content,
            image_url: p.image_url,
            created_at: p.created_at,
            profiles: mappedProfile // Assign the correctly mapped profile object
          };
        }) as Post[]; // Type assertion remains
        
        setPosts(fetchedPosts);
      } else {
        setPosts([]);
      }
    } catch (e: any) {
      console.error("Error fetching posts:", e);
      setError(e.message || 'Failed to load feed.');
      setPosts([]); // Clear posts on error
    } 
  };

  // Rename and modify function to fetch all stats
  const fetchPostStats = async (postIds: string[], currentUserId: string | undefined) => {
    if (!postIds || postIds.length === 0) return {}; // No posts, return empty stats
    
    console.log("Fetching stats for posts:", postIds);
    const newPostStats: Record<string, PostStats> = {};

    try {
      for (const postId of postIds) {
        let likes = 0;
        let comments = 0;
        let liked = false;

        // Fetch like count - Use matching parameter name
        const { data: countData, error: countError } = await supabase.rpc('get_post_like_count', { post_id_input: postId });
        if (countError) console.warn(`Error fetching like count for post ${postId}:`, countError.message);
        else if (typeof countData === 'number') likes = countData;

        // Fetch comment count - Param name 'post_id_input' should match the SQL function
        const { data: commentCountData, error: commentCountError } = await supabase.rpc('get_post_comment_count', { post_id_input: postId });
        if (commentCountError) console.warn(`Error fetching comment count for post ${postId}:`, commentCountError.message);
        else if (typeof commentCountData === 'number') comments = commentCountData;

        // Fetch user like status only if user is logged in - Use matching parameter names
        if (currentUserId) {
            const { data: likedData, error: likedError } = await supabase.rpc('user_has_liked_post', { post_id_input: postId, user_id_input: currentUserId });
            if (likedError) console.warn(`Error fetching user like status for post ${postId}:`, likedError.message);
            else if (typeof likedData === 'boolean') liked = likedData;
        }

        newPostStats[postId] = { likes, comments, liked };
      }
      console.log("Fetched post stats:", newPostStats);
      return newPostStats;

    } catch (error: any) {
      console.error("Error fetching post stats:", error);
      return {}; // Return empty on general error
    }
  };

  // --- Fetch posts and stats when screen comes into focus ---
  const loadFeed = useCallback(() => {
    console.log("--- loadFeed triggered ---"); // Log start
    setError(null);
    // setLoading(true); 

    fetchPosts().then(() => {
      console.log("--- fetchPosts completed ---"); // Log after posts fetch
      setPosts(currentPosts => { 
        console.log(`--- currentPosts count after fetchPosts: ${currentPosts.length} ---`); // Log post count
        // Optional: Log first post ID to see if it's the new one
        if (currentPosts.length > 0) console.log(`--- First post ID: ${currentPosts[0].id} ---`); 
        
        if (currentPosts.length > 0) {
            const postIds = currentPosts.map(p => p.id);
            console.log(`--- Fetching stats for post IDs: [${postIds.join(', ')}] ---`); // Log IDs for stats fetch
            fetchPostStats(postIds, user?.id).then(stats => {
              console.log("--- fetchPostStats completed, received stats: ---", stats); // Log fetched stats
              setPostStats(stats); 
            });
        } else {
            console.log("--- No posts found, clearing stats --- ");
            setPostStats({});
        }
        return currentPosts; 
      });
    }).catch((err) => { 
        console.error("--- Error in fetchPosts within loadFeed: ---", err);
        setError(err.message || 'Failed to load feed.');
    }).finally(() => {
       console.log("--- loadFeed finally block ---");
       // setLoading(false); 
    });
  }, [user]); // Keep user dependency for now

  // Use useFocusEffect to load data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFeed();
      // Optional: Return a cleanup function if needed
      return () => {
        // console.log("Feed screen blurred");
      };
    }, [loadFeed]) // Depend on the memoized loadFeed function
  );

  // --- Pull-to-refresh handler ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await fetchPosts();
    setPosts(currentPosts => { 
        if (currentPosts.length > 0) {
            const postIds = currentPosts.map(p => p.id);
            fetchPostStats(postIds, user?.id).then(stats => {
              setPostStats(stats);
            });
        } else {
            setPostStats({});
        }
        return currentPosts;
    });
    setRefreshing(false);
  }, [user]); 

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
    // Get stats from postStats state
    const stats = postStats[item.id] || { likes: 0, comments: 0, liked: false };

    // Function to navigate to post detail
    const goToPostDetail = () => {
      navigation.navigate('PostDetail', { postId: item.id });
    };

    // --- ADD LOG HERE ---
    if (item.image_url) {
      console.log(`Rendering post ${item.id} with image URL:`, item.image_url);
    }
    // --- END LOG --- 

    return (
      <TouchableOpacity onPress={goToPostDetail} activeOpacity={0.8} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          {/* TODO: Add Avatar Image */} 
          <ThemedText weight="semiBold" style={styles.usernameText}>{item.profiles?.username || 'Unknown User'}</ThemedText>
        </View>

        {/* Post Image */} 
        {item.image_url && (
           <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />
        )}

        {/* Post Content */}
        {item.content && (
             <View style={styles.postContentContainer}> 
                <ThemedText style={styles.postContentText}>{item.content}</ThemedText>
             </View>
        )}

        {/* Timestamp Container (for alignment) */}
        <View style={styles.timestampContainer}>
            <ThemedText variant="caption" color="textSecondary" style={styles.timestampText}>
                {dayjs(item.created_at).fromNow()}
            </ThemedText>
        </View>
        
        {/* Post Actions */} 
        <View style={styles.actionsContainer}>
             {/* Like Button */} 
             <TouchableOpacity style={styles.actionButton} onPress={() => handleLikeToggle(item.id)}>
                 <Ionicons 
                   name={stats.liked ? 'heart' : 'heart-outline'} 
                   size={22} // Slightly smaller icon
                   color={stats.liked ? colors.error : colors.textSecondary} 
                 />
                 <ThemedText style={styles.actionText}>{stats.likes > 0 ? stats.likes : ''}</ThemedText>
             </TouchableOpacity>
             {/* Comment Button */} 
             <TouchableOpacity style={styles.actionButton} onPress={goToPostDetail}>
                  <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} /> // Slightly smaller icon
                  <ThemedText style={styles.actionText}>{stats.comments > 0 ? stats.comments : ''}</ThemedText>
             </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Empty List Component
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {!loading && !error && <ThemedText>No posts yet. Be the first!</ThemedText>}
      {error && <ThemedText variant="error">Error: {error}</ThemedText>} 
    </View>
  );

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  return (
    <ScreenWrapper withScrollView={false} style={styles.screenWrapperStyle}>
      {/* Optional Header */}
      {/* <ThemedText variant="header" style={styles.title}>Feed</ThemedText> */}

      {loading && posts.length === 0 ? (
         <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreatePost}>
        <ThemedText style={styles.fabIcon}>+</ThemedText>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  screenWrapperStyle: { 
      // No padding here, padding handled by list container
  },
  listContainer: {
    paddingHorizontal: spacing.md, // Add horizontal padding to the list itself
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg + 70, 
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  postCard: {
    backgroundColor: colors.white, // Use white for cards
    borderRadius: 12,
    marginBottom: spacing.lg, // Increase space between cards
    borderWidth: 1,
    borderColor: colors.greyLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Slightly increase shadow offset
    shadowOpacity: 0.08, // Slightly increase shadow opacity
    shadowRadius: 4, // Slightly increase shadow radius
    elevation: 3, // Adjust elevation for Android
  },
  postHeader: { 
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm, // Consistent vertical padding
  },
  usernameText: { // Style specifically for username
      fontSize: 16, // Example size
  },
  postImage: {
    width: '100%', 
    aspectRatio: 16 / 9, 
    backgroundColor: '#ff00ff', // Magenta - Add temporary background color
    // No border radius needed if card clips content (add overflow: 'hidden' to postCard if needed)
  },
  postContentContainer: { // Container for content text padding
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm, // Consistent vertical padding
  },
  postContentText: { // Style for content text
      fontSize: 15, // Example size
      lineHeight: 21, // Improve readability
  },
  timestampContainer: { // Container for timestamp padding/alignment
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm, // Consistent vertical padding
      alignItems: 'flex-end', // Align timestamp to the right
  },
  timestampText: { // Style for timestamp text
      fontSize: 12, // Make timestamp smaller
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, // Consistent vertical padding
    borderTopWidth: 1, 
    borderTopColor: colors.greyLight,
    alignItems: 'center', // Vertically align items in action bar
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg, 
    paddingVertical: spacing.xs, // Add small vertical padding for touch area
  },
  actionText: {
    marginLeft: spacing.xs + 2, // Slightly more space after icon
    fontSize: 14, // Adjust size
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 30,
    color: colors.white,
    lineHeight: 30,
  }
});

export default FeedScreen; 