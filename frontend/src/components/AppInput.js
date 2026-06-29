import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { colors } from '../theme';

function AppInput(props) {
  return (
    <TextInput
      mode="outlined"
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      textColor={colors.textPrimary}
      placeholderTextColor={colors.textSecondary}
      style={[styles.input, props.style]}
      {...props}
    />
  );
}

AppInput.Icon = TextInput.Icon;

export default AppInput;

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.white,
  },
});
