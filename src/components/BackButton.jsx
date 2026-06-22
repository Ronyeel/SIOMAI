import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

/**
 * Consistent back button used across all app screens.
 * Plain red chevron with no background box.
 */
export default function BackButton({ onPress, style }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={onPress || (() => router.back())}
      style={[styles.backButton, style]}
      activeOpacity={0.6}
    
    >
      <Ionicons name="chevron-back" size={32} color="#D00D14" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

