import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

export default function SecondaryButton({ children, style, labelStyle, ...props }) {
  return (
    <Button
      mode="outlined"
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
    borderColor: colors.border,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 3,
  },
});
