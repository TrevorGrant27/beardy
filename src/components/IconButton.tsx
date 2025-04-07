import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface IconButtonProps extends TouchableOpacityProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  size = 24, // Default icon size
  color = theme.colors.textPrimary, // Default to primary text color
  onPress,
  style,
  disabled,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...rest}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={size}
        color={disabled ? theme.colors.greyMedium : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.sm, // Add some padding for touch area
    borderRadius: 50, // Make it circular if desired, adjust padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    // Optionally change background or opacity for disabled state
    // backgroundColor: theme.colors.greyLight,
  },
});

export default IconButton; 