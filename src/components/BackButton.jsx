import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

/**
 * Consistent back button used across all app screens.
 * Matches the styled back button from the auth (forgot-password) flow.
 */
export default function BackButton({ onPress, style }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress || (() => router.back())}
      style={[styles.backButton, style]}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="chevron-back" size={24} color="#E90000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#120504',
    borderWidth: 1.5,
    borderColor: '#E90000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
