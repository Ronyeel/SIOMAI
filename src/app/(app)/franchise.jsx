import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';

export default function FranchiseScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <BackButton />
          <View style={styles.titleTextContainer}>
            <Text style={styles.screenTitle}>Franchise Management</Text>
            <Text style={styles.screenSubtitle}>Manage franchise accounts and status</Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Franchise Section Coming Soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  titleTextContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#000',
  },
  screenSubtitle: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
});
