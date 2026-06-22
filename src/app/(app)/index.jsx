import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Header';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header isDashboard={true} />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Dashboard Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Dashboard</Text>

          {/* Quick Info Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.card}>
              <Ionicons name="location-outline" size={24} color="#D00D14" />
              <Text style={styles.cardTitle}>Branch</Text>
              <Text style={styles.cardValue}>Siomai Street #1</Text>
            </View>

            <View style={styles.card}>
              <Ionicons name="time-outline" size={24} color="#D00D14" />
              <Text style={styles.cardTitle}>Shift Status</Text>
              <Text style={styles.cardValue}>On Duty</Text>
            </View>
          </View>

          {/* Activity Section */}
          <Text style={styles.sectionTitle}>Recent System Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.statusText}>Database connection stable</Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.statusText}>All terminals online</Text>
            </View>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.statusText}>Supabase session active</Text>
            </View>
          </View>
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

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFF',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.45)',
    fontWeight: '600',
    marginTop: 12,
  },
  cardValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '800',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderColor: '#E8E8E8',
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '600',
    marginLeft: 10,
  },
});
