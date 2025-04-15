import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, Button } from 'react-native';

type CreateProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateProfile'>;

interface Props {
  navigation: CreateProfileScreenNavigationProp;
}

const CreateProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, loading: authLoading, createProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProfile = async () => {
    if (!user || !username.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }
    if (usernameError) {
      Alert.alert('Error', usernameError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createProfile(username.trim());

      console.log("Profile created successfully for user:", user.id);

    } catch (err: any) {
      console.error("Error creating profile:", err);
      setError(err.message || 'Failed to create profile.');
      Alert.alert('Error', err.message || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
        title={loading ? "Creating Profile..." : "Complete Profile"} 
        onPress={handleCreateProfile} 
        disabled={loading || !!usernameError || username.trim().length < 3}
    />
  );
};

export default CreateProfileScreen; 