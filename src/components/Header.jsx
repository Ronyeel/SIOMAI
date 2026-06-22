import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../hooks/useAuth';
import { useDrawer } from '../context/DrawerContext';

export default function Header({ isDashboard = false }) {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();

  // Get current date
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Render Dashboard Header (1st photo)
  if (isDashboard) {
    const firstName = user?.name ? user.name.split(' ')[0] : 'User';

    return (
      <View style={styles.dashboardHeaderContainer}>
        <LinearGradient
          colors={['#D00D14', '#5C0000']}
          style={styles.dashboardHeaderBanner}
        >
          <View style={styles.headerRow}>
            {/* Left Side: Avatar & Name/Role Info */}
            <View style={styles.leftContainer}>
              <View style={styles.dashboardAvatarContainer}>
                <View style={styles.dashboardAvatar}>
                  <Text style={styles.dashboardAvatarText}>{getInitials(user?.name)}</Text>
                </View>
              </View>
              
              <View style={styles.dashboardInfoContainer}>
                <Text style={styles.dashboardDateText}>{dayName}, {monthDay.toUpperCase()}</Text>
                <Text style={styles.dashboardNameText}>{user?.name || 'User Name'}</Text>
                <Text style={styles.dashboardRoleText}>{user?.role || 'Admin'}</Text>
                <View style={styles.branchRow}>
                  <Ionicons name="location" size={13} color="#FFF" style={styles.locationIcon} />
                  <Text style={styles.branchText}>Main Branch - Daet, CN</Text>
                </View>
              </View>
            </View>

            {/* Right Side: Notification & Hamburger */}
            <View style={styles.rightContainer}>
              <TouchableOpacity 
                style={styles.bellButton}
                activeOpacity={0.7}
                onPress={() => console.log('Notification bell pressed')}
              >
                <Ionicons name="notifications" size={20} color="#FFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuButton}
                activeOpacity={0.7}
                onPress={toggleDrawer}
              >
                <Ionicons name="menu" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Overlapping Welcome Card & Mascot */}
        <View style={styles.welcomeCardContainer}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeCardText}>Welcome Back, {firstName}!</Text>
          </View>
          <Image
            source={require('../../assets/images/siomai_mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Render Common Header (2nd photo)
  return (
    <LinearGradient
      colors={['#D00D14', '#8B0000']}
      style={styles.commonHeaderBanner}
    >
      <View style={styles.headerRow}>
        {/* Left Side: Logo & Info */}
        <View style={styles.leftContainer}>
          <Image
            source={require('../../assets/images/siomai_street_logo.png')}
            style={styles.commonLogo}
            resizeMode="contain"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.dateText}>{dayName}, {monthDay.toUpperCase()}</Text>
            <View style={styles.branchRow}>
              <Ionicons name="location" size={13} color="#FFF" style={styles.locationIcon} />
              <Text style={styles.branchText}>Main Branch - Daet, CN</Text>
            </View>
          </View>
        </View>

        {/* Right Side: Notification & Hamburger */}
        <View style={styles.rightContainer}>
          <TouchableOpacity 
            style={styles.bellButton}
            activeOpacity={0.7}
            onPress={() => console.log('Notification bell pressed')}
          >
            <Ionicons name="notifications" size={20} color="#FFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={toggleDrawer}
          >
            <Ionicons name="menu" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Dashboard style
  dashboardHeaderContainer: {
    position: 'relative',
    marginBottom: 50, // Space for overlapping card
    backgroundColor: 'transparent',
  },
  dashboardHeaderBanner: {
    paddingTop: Platform.OS === 'ios' ? 45 : 35,
    paddingHorizontal: 16,
    paddingBottom: 65, // Taller bottom padding to center info card
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  dashboardAvatarContainer: {
    marginRight: 12,
  },
  dashboardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dashboardAvatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  dashboardInfoContainer: {
    justifyContent: 'center',
  },
  dashboardDateText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  dashboardNameText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 1,
  },
  dashboardRoleText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 1,
  },

  // Welcome card overlay styles
  welcomeCardContainer: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    right: 16,
    height: 85,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  welcomeCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '68%',
    height: 70,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeCardText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '800',
  },
  mascotImage: {
    width: 110,
    height: 110,
    position: 'absolute',
    right: 0,
    bottom: -8,
    zIndex: 11,
  },

  // Common Header style
  commonHeaderBanner: {
    paddingTop: Platform.OS === 'ios' ? 45 : 35,
    paddingHorizontal: 16,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  commonLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 12,
  },

  // Shared Header Row style
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  dateText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationIcon: {
    marginRight: 2,
    opacity: 0.9,
  },
  branchText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  menuButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
});
