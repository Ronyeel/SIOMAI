import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../hooks/useAuth';
import { API_URL } from '../../config/env';

// Modular components
import AccountCard from '../../components/accounts/AccountCard';
import AccountDetailModal from '../../components/accounts/AccountDetailModal';
import AccountFormModal from '../../components/accounts/AccountFormModal';

export default function AccountsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // Modals Visibility
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // Submissions State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected targets
  const [selectedUser, setSelectedUser] = useState(null);
  const [popupY, setPopupY] = useState(100);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `${API_URL}/api/admin/users?adminEmail=${encodeURIComponent(user?.email || '')}`
      );
      const data = await response.json();
      if (response.ok) {
        setAllUsers(data.users || []);
      } else {
        console.error('Fetch users failed:', data.error);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenOptions = (item, event) => {
    if (item.user_email === user?.email) {
      // Don't show options menu for the currently logged-in admin
      return;
    }
    const pageY = event?.nativeEvent?.pageY || 100;
    setSelectedUser(item);
    setPopupY(pageY - 15);
    setOptionsVisible(true);
  };

  const handleViewUser = () => {
    setOptionsVisible(false);
    setDetailModalVisible(true);
  };

  const handleEditUser = () => {
    setOptionsVisible(false);
    setFormMode('edit');
    setFormModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    const targetUser = selectedUser; // snapshot before closing options
    if (!targetUser) return;
    setOptionsVisible(false);
    const newStatus = targetUser.user_status === 'Active' ? 'Pending' : 'Active';
    try {
      const response = await fetch(`${API_URL}/api/admin/update-user-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          targetEmail: targetUser.user_email,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', `User status updated to ${newStatus}.`);
        fetchUsers();
      } else {
        Alert.alert('Error', data.error || 'Failed to update user status.');
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleDeleteUser = () => {
    const targetUser = selectedUser; // snapshot before closing options
    if (!targetUser) return;
    setOptionsVisible(false);
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to permanently delete account for ${targetUser.user_email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/api/admin/delete-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  adminEmail: user.email,
                  targetEmail: targetUser.user_email,
                }),
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert('Deleted', 'Account deleted successfully.');
                fetchUsers();
              } else {
                Alert.alert('Error', data.error || 'Failed to delete user.');
              }
            } catch (error) {
              console.error('Delete user error:', error);
            }
          },
        },
      ]
    );
  };

  // Form submission handler (Create or Edit)
  const handleFormSubmit = async (formData) => {
    const { name, email, password, role, status } = formData;

    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation Error', 'Name and Email are required.');
      return;
    }

    if (formMode === 'create' && !password.trim()) {
      Alert.alert('Validation Error', 'Password is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (formMode === 'create') {
        const response = await fetch(`${API_URL}/api/admin/create-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: user.email,
            name: name.trim(),
            email: email.trim(),
            password: password,
            role,
            status,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', 'User account created successfully.');
          setFormModalVisible(false);
          fetchUsers();
        } else {
          Alert.alert('Error', data.error || 'Failed to create user.');
        }
      } else {
        // Edit Mode
        const response = await fetch(`${API_URL}/api/admin/update-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: user.email,
            targetEmail: selectedUser.user_email,
            name: name.trim(),
            password: password.trim() ? password : undefined,
            role,
            status,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', 'User account updated successfully.');
          setFormModalVisible(false);
          fetchUsers();
        } else {
          Alert.alert('Error', data.error || 'Failed to update user.');
        }
      }
    } catch (error) {
      console.error('Submit form error:', error);
      Alert.alert('Error', 'Communication error with backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users by search
  const filteredUsers = allUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.user_name?.toLowerCase().includes(query) ||
      u.user_email?.toLowerCase().includes(query)
    );
  });

  const activeAccounts = filteredUsers.filter((u) => u.user_status === 'Active');
  const pendingAccounts = filteredUsers.filter((u) => u.user_status !== 'Active');

  // If user is not admin, show Access Denied
  if (user?.role !== 'Admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={80} color="#D00D14" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Only administrators are authorized to manage accounts, franchisees, and staff members.
          </Text>
          <TouchableOpacity
            style={styles.backHomeButton}
            onPress={() => router.replace('/(app)')}
          >
            <Text style={styles.backHomeButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={fetchUsers} colors={['#D00D14']} />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <BackButton />
          <View style={styles.titleTextContainer}>
            <Text style={styles.screenTitle}>Account Management</Text>
            <Text style={styles.screenSubtitle}>Manage Account's Roles and Permissions</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(0, 0, 0, 0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search User"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(0, 0, 0, 0.4)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* User Sections */}
        <View style={styles.listContainer}>
          {/* Active Accounts Section */}
          <Text style={styles.sectionHeader}>Active Accounts ({activeAccounts.length})</Text>
          {activeAccounts.length > 0 ? (
            activeAccounts.map((item) => (
              <AccountCard
                key={item.user_id}
                item={item}
                currentUserEmail={user?.email}
                onOpenOptions={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active accounts found.</Text>
            </View>
          )}

          {/* Pending Accounts Section */}
          <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
            Pending Accounts ({pendingAccounts.length})
          </Text>
          {pendingAccounts.length > 0 ? (
            pendingAccounts.map((item) => (
              <AccountCard
                key={item.user_id}
                item={item}
                currentUserEmail={user?.email}
                onOpenOptions={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending accounts.</Text>
            </View>
          )}
        </View>

        {/* Space for FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button for Account Creation */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setFormMode('create');
          setFormModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* OPTIONS OVERLAY POPUP */}
      <Modal
        visible={optionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <Pressable style={styles.optionsOverlay} onPress={() => setOptionsVisible(false)}>
          <View style={[styles.optionsPopup, { top: popupY }]}>
            <TouchableOpacity style={styles.optionItem} onPress={handleViewUser} activeOpacity={0.7}>
              <Text style={styles.optionText}>View Details</Text>
              <Ionicons name="information-circle-outline" size={18} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleUpdateStatus}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>
                {selectedUser?.user_status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              </Text>
              <Ionicons
                name={selectedUser?.user_status === 'Active' ? 'ban-outline' : 'checkmark-circle-outline'}
                size={16}
                color={selectedUser?.user_status === 'Active' ? '#FF9500' : '#34C759'}
              />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleEditUser} activeOpacity={0.7}>
              <Text style={styles.optionText}>Edit Details</Text>
              <Ionicons name="pencil-outline" size={16} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleDeleteUser} activeOpacity={0.7}>
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>Delete Account</Text>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* CREATE / EDIT ACCOUNT FORM MODAL */}
      <AccountFormModal
        visible={formModalVisible}
        mode={formMode}
        initialData={selectedUser}
        isSubmitting={isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModalVisible(false)}
      />

      {/* ACCOUNT DETAILS VIEW MODAL */}
      <AccountDetailModal
        visible={detailModalVisible}
        selectedUser={selectedUser}
        onClose={() => setDetailModalVisible(false)}
      />
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
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  titleTextContainer: {
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  listContainer: {},
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D00D14',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionsPopup: {
    position: 'absolute',
    right: 20,
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  backHomeButton: {
    backgroundColor: '#D00D14',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
