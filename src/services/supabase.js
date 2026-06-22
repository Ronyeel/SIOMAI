import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

// Fallback in-memory storage for environments where SecureStore isn't fully supported
const memoryStorage = {};

/**
 * Secure storage adapter for Supabase session persistence.
 * Uses expo-secure-store to keep tokens encrypted on-device.
 * Falls back gracefully to memory/localStorage on web/mock environments.
 */
const SecureStoreAdapter = {
  getItem: async (key) => {
    try {
      if (Platform.OS !== 'web' && SecureStore && typeof SecureStore.getItemAsync === 'function') {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.warn('SecureStore.getItemAsync not available, using fallback:', error.message);
    }
    // Fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS !== 'web' && SecureStore && typeof SecureStore.setItemAsync === 'function') {
        await SecureStore.setItemAsync(key, value);
        return;
      }
    } catch (error) {
      console.warn('SecureStore.setItemAsync not available, using fallback:', error.message);
    }
    // Fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS !== 'web' && SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
        await SecureStore.deleteItemAsync(key);
        return;
      }
    } catch (error) {
      console.warn('SecureStore.deleteItemAsync not available, using fallback:', error.message);
    }
    // Fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    // React Native exposes WebSocket as a global at runtime.
    // Passing it explicitly here stops Supabase JS v2.108+ from throwing
    // "Node.js 20 detected without native WebSocket support" when Metro
    // evaluates this module on Node.js < 22 during bundling.
    transport: globalThis.WebSocket,
  },
});
