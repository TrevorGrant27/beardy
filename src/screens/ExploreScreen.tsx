import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import ThemedText from '../components/ThemedText';
import LoadingIndicator from '../components/LoadingIndicator';
import IconButton from '../components/IconButton';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../theme';

const ExploreScreen = () => {
  const [textValue, setTextValue] = useState('');
  const [errorValue, setErrorValue] = useState('');

  // ---- TEMPORARY: Remove this line used to test the error boundary ----
  // throw new Error('Test Error Boundary');
  // --------------------------------------------------------------------

  return (
    <ScreenWrapper contentContainerStyle={styles.scrollContainer}>
      <ThemedText variant="header" style={styles.title}>
        Component Showcase
      </ThemedText>

      <Card style={styles.componentSpacing}>
        <ThemedText variant="header" size="h3" style={styles.componentLabel}>
          ThemedText Variants:
        </ThemedText>
        <ThemedText variant="body">This is body text (default).</ThemedText>
        <ThemedText variant="label">This is label text.</ThemedText>
        <ThemedText variant="caption">This is caption text.</ThemedText>
        <ThemedText variant="error">This is error text.</ThemedText>
        <ThemedText weight="bold" color="primary">
          Bold Primary Color Text.
        </ThemedText>
      </Card>

      <Card style={styles.componentSpacing}>
        <ThemedText variant="header" size="h3" style={styles.componentLabel}>
          Card Component:
        </ThemedText>
        <ThemedText>This content is inside a Card.</ThemedText>
      </Card>

      <Card style={styles.componentSpacing}>
        <ThemedText variant="header" size="h3" style={styles.componentLabel}>
          Input Components:
        </ThemedText>
        <Input
          label="Standard Input"
          placeholder="Enter some text..."
          value={textValue}
          onChangeText={setTextValue}
          containerStyle={styles.inputSpacing}
        />
        <Input
          label="Input with Error"
          placeholder="Enter text (1-2 chars) to see error"
          value={errorValue}
          onChangeText={setErrorValue}
          error={errorValue.length > 0 && errorValue.length < 3 ? 'Input too short' : ''}
          containerStyle={styles.inputSpacing}
        />
      </Card>

      <Card style={styles.componentSpacing}>
        <ThemedText variant="header" size="h3" style={styles.componentLabel}>
          Button Components:
        </ThemedText>
        <View style={styles.rowContainer}>
          <Button
            title="Test Button"
            onPress={() => console.log('Test Button Pressed!')}
            style={styles.buttonFlex}
          />
          <Button
            title="Disabled"
            onPress={() => {}}
            disabled
            style={styles.buttonFlex}
          />
        </View>
        <ThemedText variant="label" style={styles.spacingTop}>Icon Buttons:</ThemedText>
        <View style={styles.rowContainer}>
          <IconButton iconName="heart" onPress={() => {}} color={theme.colors.primary} />
          <IconButton iconName="camera" onPress={() => {}} />
          <IconButton iconName="cog" onPress={() => {}} disabled />
          <IconButton iconName="delete" onPress={() => {}} color={theme.colors.error} />
        </View>
      </Card>

      <Card style={styles.componentSpacing}>
        <ThemedText variant="header" size="h3" style={styles.componentLabel}>
          Loading Indicator:
        </ThemedText>
        <LoadingIndicator size="small" style={{ height: 40 }} />
      </Card>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  componentSpacing: {
    marginBottom: theme.spacing.lg,
    width: '90%',
    alignSelf: 'center',
  },
  componentLabel: {
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
    paddingBottom: theme.spacing.sm,
  },
  inputSpacing: {
    marginBottom: theme.spacing.md,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonFlex: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  spacingTop: {
    marginTop: theme.spacing.md,
  },
});

export default ExploreScreen; 