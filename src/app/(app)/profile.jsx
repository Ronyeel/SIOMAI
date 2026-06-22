import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert as RNAlert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Header';

// Modular Profile Tab Components
import ProfileTabPersonal from '../../components/profile/ProfileTabPersonal';
import ProfileTabAccount from '../../components/profile/ProfileTabAccount';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('personal');

  const handleLogout = () => {
    RNAlert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

        {/* ── Page Content ──────────────────────── */}
        <View style={styles.pageContent}>
          {/* Title */}
          <Text style={styles.pageTitle}>Account{'\n'}Information</Text>

          {/* ── Tab Bar (underline style) ──────────── */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'account' && styles.tabActive]}
              onPress={() => setActiveTab('account')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === 'account' && styles.tabLabelActive]}>
                Account data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
              onPress={() => setActiveTab('personal')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === 'personal' && styles.tabLabelActive]}>
                Personal data
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabDivider} />

          {/* ── Personal Data Tab ──────────────────── */}
          {activeTab === 'personal' && (
            <ProfileTabPersonal
              user={user}
              onUpdateProfile={updateProfile}
            />
          )}

          {/* ── Account Data Tab ──────────────────── */}
          {activeTab === 'account' && (
            <ProfileTabAccount
              user={user}
              onLogout={handleLogout}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#F6F6F6',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 34,
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 24,
  },
  tab: {
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#D00D14',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.35)',
  },
  tabLabelActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  tabDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: -1,
    marginBottom: 24,
  },
});
