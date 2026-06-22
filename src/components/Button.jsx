import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function Button({
  title,
  onPress,
  isLoading,
  disabled,
  style,
  textStyle,
  activityColor = '#000',
  ...props
}) {
  const isButtonDisabled = disabled || isLoading;
  
  return (
    <TouchableOpacity
      style={[styles.button, isButtonDisabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={activityColor} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
