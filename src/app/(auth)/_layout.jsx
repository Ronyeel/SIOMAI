import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: false,
          title: 'Forgot Password',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: false,
          title: 'Reset Password',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: false,
          title: 'Change Password',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
