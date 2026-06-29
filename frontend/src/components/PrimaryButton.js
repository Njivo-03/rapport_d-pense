import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

export default function PrimaryButton({ children, style, labelStyle, ...props }) {
  return (
    <Button
      mode="contained"
      buttonColor={colors.primary}
      textColor={colors.textPrimary}
      style={[styles.button, style]}
      labelStyle={[styles.label, labelStyle]}
      {...props}
    >
      {children}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 4,
  },
});
