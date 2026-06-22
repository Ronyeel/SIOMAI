import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDrawer from '../../components/CustomDrawer';

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  // Dynamically compute responsive tab bar height and bottom padding
  // Standard tab bar height is 60px.
  // Add bottom safe area inset (e.g. 34px on iPhones with home indicator, or 0-24px on Android).
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const tabHeight = 60 + bottomPadding;

  return (
    <>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#D00D14',
            borderTopWidth: 0,
            height: tabHeight,
            paddingBottom: bottomPadding,
            paddingTop: 8,
          },
          tabBarItemStyle: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={focused ? 'alert-octagon' : 'alert-octagon-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'chatbubble' : 'chatbubble-outline'}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={30}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="branch_management"
          options={{
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="franchise"
          options={{
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="supply"
          options={{
            tabBarItemStyle: { display: 'none' },
            tabBarButton: () => null,
          }}
        />
      </Tabs>
      <CustomDrawer />
    </>
  );
}
