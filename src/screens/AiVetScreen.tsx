import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AiVetScreen = () => {
  return (
    <View style={styles.container}>
      <Text>AI Vet Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AiVetScreen; 