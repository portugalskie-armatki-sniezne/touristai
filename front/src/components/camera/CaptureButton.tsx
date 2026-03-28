import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';

export interface CaptureButtonProps extends ViewProps {
  onCapture: () => void;
  disabled?: boolean;
}

export function CaptureButton({ onCapture, disabled, style, ...rest }: CaptureButtonProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCapture}
        disabled={disabled}
        style={[styles.outerCircle, disabled && styles.disabled]}
      >
        <View style={styles.innerCircle} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  disabled: {
    opacity: 0.5,
  },
});
