import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import SplashView from '../components/SplashView';
import { DrawerProvider } from '../context/DrawerContext';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBar) {
      if (typeof NavigationBar.setBackgroundColorAsync === 'function') {
        NavigationBar.setBackgroundColorAsync('#D00D14').catch((err) =>
          console.warn('NavigationBar error:', err)
        );
      }
      if (typeof NavigationBar.setButtonStyleAsync === 'function') {
        NavigationBar.setButtonStyleAsync('light').catch((err) =>
          console.warn('NavigationBar style error:', err)
        );
      }
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!user && !inAuthGroup) {
      // User is not signed in: redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is signed in: redirect to the home screen in (app)
      router.replace('/(app)');
    }
  }, [user, isLoading, segments, inAuthGroup]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <View style={{ flex: 1, backgroundColor: '#D00D14' }} />;
    }

    if (!user && !inAuthGroup) {
      return null;
    }

    if (user && inAuthGroup) {
      return null;
    }

    return <Slot />;
  };

  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      {showSplash && (
        <SplashView isLoading={isLoading} onFinish={handleSplashFinish} />
      )}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Cookie-Regular': require('../../assets/font/Cookie-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <DrawerProvider>
        <InitialLayout />
      </DrawerProvider>
    </AuthProvider>
  );
}
