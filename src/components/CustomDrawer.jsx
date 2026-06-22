import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Image,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useDrawer } from '../context/DrawerContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.62;

export default function CustomDrawer() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isDrawerOpen, closeDrawer } = useDrawer();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDrawerOpen) {
      slideAnim.setValue(-DRAWER_WIDTH);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDrawerOpen]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      closeDrawer();
    });
  };

  const navigateTo = (route, tabName) => {
    handleClose();
    setTimeout(() => {
      if (route) {
        router.push(route);
      } else {
        Alert.alert(tabName, `${tabName} section is coming soon!`);
      }
    }, 250);
  };

  const handleLogout = async () => {
    handleClose();
    setTimeout(async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }, 250);
  };

  return (
    <Modal
      visible={isDrawerOpen}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable 
          style={StyleSheet.absoluteFillObject} 
          onPress={handleClose}
        >
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </Pressable>

        {/* Drawer Body */}
        <Animated.View style={[styles.drawerBody, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header Row */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/images/siomai_street_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.logoTitle}>SIOMAI</Text>
              <Text style={styles.logoTitle}>STREET</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo('/(app)')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Dashboard</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo('/(app)/branch_management', 'Branch Monitoring')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Branch Monitoring</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo('/(app)/inventory')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Inventory</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo('/(app)/reports', 'Reports and Analytics')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Reports and Analytics</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo(null, 'Franchise Management')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Franchise Management</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigateTo(null, 'Supply Management')}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Supply Management</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Log Out */}
            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={handleLogout}
            >
              {({ pressed }) => (
                <Text style={[styles.menuText, pressed && styles.menuTextPressed]}>Log Out</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawerBody: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#E90000',
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FFF',
    marginRight: 12,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: 'Cookie-Regular',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 3,
    borderRadius: 14,
    width: '100%',
  },
  menuItemPressed: {
    backgroundColor: '#FFF',
  },
  menuText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuTextPressed: {
    color: '#E90000',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFF',
    opacity: 0.3,
    marginVertical: 15,
    width: '100%',
  },
});
