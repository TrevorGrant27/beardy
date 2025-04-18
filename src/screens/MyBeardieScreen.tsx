import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type MyBeardieNavigationProp = StackNavigationProp<RootStackParamList>;

const MyBeardieScreen = () => {
  const { beardie, loadingBeardie } = useAuth();
  const navigation = useNavigation<MyBeardieNavigationProp>();

  const handleAddBeardie = () => {
    navigation.navigate('AddBeardieInfo');
  };

  if (loadingBeardie) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!beardie) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredContainer}>
          <ThemedText variant="header" size="h2" style={styles.promptHeader}>
            Add Your Beardie!
          </ThemedText>
          <ThemedText style={styles.promptText}>
            Tap below to add your bearded dragon's name and photo to get started.
          </ThemedText>
          <Button 
            title="Add Your Beardie" 
            onPress={handleAddBeardie}
            style={styles.addButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Image 
            source={beardie.profile_photo_url ? { uri: beardie.profile_photo_url } : require('../../assets/images/default-avatar.png')}
            style={styles.beardieAvatar}
        />
        <ThemedText variant="header" size="h1" style={styles.beardieName}>{beardie.name}</ThemedText>
        
        <ThemedText style={styles.placeholder}>
          (Photo Wall and Care Log coming soon!)
        </ThemedText>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  promptHeader: {
      marginBottom: spacing.md,
      textAlign: 'center',
  },
  promptText: {
      marginBottom: spacing.xl,
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: typography.fontSizes.lg,
      lineHeight: typography.fontSizes.lg * 1.4,
  },
  addButton: {
      width: '80%',
  },
  beardieAvatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.greyLight,
      marginBottom: spacing.md,
  },
  beardieName: {
      marginBottom: spacing.lg,
  },
  placeholder: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

export default MyBeardieScreen; 