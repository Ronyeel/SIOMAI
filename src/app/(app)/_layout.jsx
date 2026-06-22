import React from 'react';
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';
import CustomDrawer from '../../components/CustomDrawer';

export default function AppLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#D00D14',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alert-circle" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble" size={30} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={32} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="branch_management"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="franchise"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="notification"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="supply"
          options={{
            href: null,
            tabBarButton: () => null,
          }}
        />
      </Tabs>
      <CustomDrawer />
    </>
  );
}
