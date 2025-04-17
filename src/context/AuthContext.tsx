console.log("--- Executing AuthContext.tsx ---");
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Session, User, AuthError, SignInWithPasswordCredentials, SignUpWithPasswordCredentials, PostgrestError } from '@supabase/supabase-js';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase'; // Use relative path for now

// Define the shape of the profile data we expect from the 'profiles' table
export interface Profile {
  id: string; // UUID, matches auth.users.id
  username: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  loadingProfile: boolean;
  needsOnboardingPrompt: boolean;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  createProfile: (username: string) => Promise<{ error: PostgrestError | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserPassword: (password: string) => Promise<{ error: AuthError | null }>;
  clearOnboardingPrompt: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [needsOnboardingPrompt, setNeedsOnboardingPrompt] = useState<boolean>(false);

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (e) {
        console.error('Error fetching initial session:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (!currentSession) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      if (profile !== null) {
        console.log("--- useEffect[user]: Clearing profile state (no user) ---");
        setProfile(null);
      }
      return;
    }

    if (profile && profile.id === user.id) {
      console.log(`--- useEffect[user]: Skipping profile fetch (already have profile for ${user.id}) ---`);
      return;
    }

    if (loadingProfile) {
      console.log("--- useEffect[user]: Skipping profile fetch (loadingProfile is true) ---");
      return;
    }

    console.log(`--- useEffect[user]: Triggering profile fetch for user ${user.id} ---`);
    setLoadingProfile(true);

    const fetchProfileForUser = async (userId: string) => {
      console.log(`--->>> Fetching profile for user: ${userId}`);
      try {
        const { data, error, status } = await supabase
          .from('profiles')
          .select('id, username, created_at, updated_at, avatar_url')
          .eq('id', userId)
          .single();

        if (error && status !== 406) {
          console.error(`--- useEffect[user]: Error fetching profile for ${userId}: ---`, error.message);
          setProfile(null);
        } else if (data) {
          console.log(`--- useEffect[user]: Profile fetched for ${userId}: ${data.username} ---`);
          setProfile(data as Profile);
        } else {
          console.log(`--- useEffect[user]: No profile found for user ${userId} ---`);
          setProfile(null);
        }
      } catch (e) {
        console.error(`--- useEffect[user]: Unexpected error fetching profile for ${userId}: ---`, e);
        setProfile(null);
      } finally {
        console.log(`--- useEffect[user]: Setting loadingProfile false for user ${userId} ---`);
        setLoadingProfile(false);
      }
    };

    fetchProfileForUser(user.id);
  }, [user]);

  // Function to manually trigger a profile refresh
  const refreshProfile = async () => {
    if (!user) {
      console.log("refreshProfile: No user, skipping.");
      return;
    }
    if (loadingProfile) {
       console.log("refreshProfile: Already loading, skipping.");
       return;
    }
    console.log(`refreshProfile: Triggering fetch for user ${user.id}`);
    setLoadingProfile(true);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, username, created_at, updated_at, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        console.error(`refreshProfile: Error fetching profile for ${user.id}:`, error.message);
        setProfile(null);
      } else if (data) {
        console.log(`refreshProfile: Profile refreshed for ${user.id}:`, data.username);
        setProfile(data as Profile);
      } else {
        console.log(`refreshProfile: No profile found for user ${user.id}`);
        setProfile(null);
      }
    } catch (e) {
      console.error(`refreshProfile: Unexpected error for ${user.id}:`, e);
      setProfile(null);
    } finally {
      console.log(`refreshProfile: Setting loadingProfile false for user ${user.id}`);
      setLoadingProfile(false);
    }
  };

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    // Log the URL the client is configured with
    console.log("--- Attempting Sign In ---");
    // console.log("Supabase client URL:", supabase.auth); // Removed .PENDING, maybe log whole object or just URL if needed
    // It's better to get the URL from the imported env variable if needed:
    // console.log("Supabase URL from env:", SUPABASE_URL);
    // Note: Don't log the anon key, even though it's public, just to be safe.

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      console.error('Sign in error:', error.message);
    }
    setLoading(false);
    return { error };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) {
      console.error('Sign up error:', error.message);
    } else {
      console.log('Sign up successful, user:', data.user);
    }
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    }
    setLoading(false);
    return { error };
  };

  const createProfile = async (username: string) => {
    if (!user) {
      console.error('Cannot create profile: User not logged in.');
      return { error: { message: 'User not authenticated', details: '', hint: '', code: '401' } as any };
    }

    setLoadingProfile(true);
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking username:', checkError.message);
        throw checkError;
      }

      if (existingUser) {
        return { error: { message: 'Username is already taken', details: '', hint: 'Try another username', code: '23505' } as any };
      }

      const profileData = {
        id: user.id,
        username: username,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').insert(profileData);

      if (error) {
        console.error('Error creating profile:', error.message);
        throw error;
      } else {
        console.log("--- Profile inserted successfully, re-fetching... ---");
        const { data: newProfileData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (fetchError) {
          console.error("--- Error re-fetching profile after create: ---", fetchError);
          throw fetchError;
        }
        if (newProfileData) {
          console.log("--- Setting needsOnboardingPrompt = true ---");
          setNeedsOnboardingPrompt(true);
          console.log("--- Re-fetched profile data, setting profile state: ---", newProfileData);
          setProfile(newProfileData as Profile);
        } else {
          console.log("--- Profile created but re-fetch returned null? ---");
        }
        return { error: null };
      }
    } catch (e: any) {
      const error = e as PostgrestError;
      return { error: { message: error.message || 'Failed to create profile', code: error.code || '500', details: error.details || '', hint: error.hint || '' } };
    } finally {
      console.log("--- Setting loadingProfile to false in createProfile finally block ---");
      setLoadingProfile(false);
    }
    return { error: { message: 'An unexpected error occurred in createProfile', code: '500', details: '', hint: '' } };
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    const redirectUrl = 'beardyapp://reset-password'; // Your custom scheme and path

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error('Password reset request error:', error.message);
    } else {
      console.log(`Password reset request sent (if email exists). Redirect configured for: ${redirectUrl}`);
    }
    setLoading(false);
    return { error };
  };

  const updateUserPassword = async (password: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated', name:'AuthError', status: 401 } as AuthError };
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setLoading(false);

    if (error) {
      console.error('Error updating password:', error.message);
    }
    return { error };
  };

  const clearOnboardingPrompt = () => {
    console.log("--- Clearing onboarding prompt flag --- ");
    setNeedsOnboardingPrompt(false);
  };

  const value = {
    session,
    user,
    profile,
    loading,
    loadingProfile,
    needsOnboardingPrompt,
    signIn,
    signUp,
    signOut,
    createProfile,
    requestPasswordReset,
    updateUserPassword,
    clearOnboardingPrompt,
    refreshProfile,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 