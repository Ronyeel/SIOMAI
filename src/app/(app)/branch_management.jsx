import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../hooks/useAuth';
import { ApiService } from '../../services/apiService';

// Modular Components
import BranchCard from '../../components/branches/BranchCard';
import BranchDetailModal from '../../components/branches/BranchDetailModal';
import BranchFormModal from '../../components/branches/BranchFormModal';

export default function BranchManagementScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Hide the bottom tab bar while this screen is active
  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            backgroundColor: '#D00D14',
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 88 : 72,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
        });
      };
    }, [navigation])
  );

  // State
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Branch');
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals Visibility
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // Selection state
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [popupY, setPopupY] = useState(100);

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchBranches();
      fetchUsers();
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      setIsFetching(true);
      const data = await ApiService.admin.getBranches(user?.email || '');
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Fetch branches error:', error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await ApiService.admin.getUsers(user?.email || '');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Fetch users error:', error.message);
    }
  };

  const handleOpenOptions = (item, event) => {
    const pageY = event?.nativeEvent?.pageY || 100;
    setSelectedBranch(item);
    setPopupY(pageY - 15);
    setOptionsVisible(true);
  };

  const handleViewBranch = (item) => {
    if (item) setSelectedBranch(item);
    setOptionsVisible(false);
    setDetailModalVisible(true);
  };

  const handleEditBranch = () => {
    setOptionsVisible(false);
    setFormMode('edit');
    setFormModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    const targetBranch = selectedBranch;
    if (!targetBranch) return;
    setOptionsVisible(false);

    const newStatus = targetBranch.branch_status === 'Active' ? 'Inactive' : 'Active';
    try {
      await ApiService.admin.updateBranchStatus(user.email, targetBranch.branch_id, newStatus);
      Alert.alert('Success', `Branch status updated to ${newStatus}.`);
      fetchBranches();
    } catch (error) {
      console.error('Update status error:', error.message);
      Alert.alert('Error', error.message || 'Failed to update status.');
    }
  };

  const handleDeleteBranch = () => {
    const targetBranch = selectedBranch;
    if (!targetBranch) return;
    setOptionsVisible(false);

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to permanently delete branch "${targetBranch.branch_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.admin.deleteBranch(user.email, targetBranch.branch_id);
              Alert.alert('Deleted', 'Branch deleted successfully.');
              fetchBranches();
            } catch (error) {
              console.error('Delete branch error:', error.message);
              Alert.alert('Error', error.message || 'Failed to delete branch.');
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (formData) => {
    const { name, address, type, status, contactNumber, managerId } = formData;

    if (!name.trim() || !address.trim() || !type) {
      Alert.alert('Validation Error', 'Name, Address and Type are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const isEdit = formMode === 'edit';

      if (isEdit) {
        await ApiService.admin.updateBranch(user.email, selectedBranch.branch_id, {
          name,
          address,
          type,
          status,
          contactNumber,
          managerId,
        });
      } else {
        await ApiService.admin.createBranch(user.email, {
          name,
          address,
          type,
          status,
          contactNumber,
          managerId,
        });
      }

      Alert.alert('Success', isEdit ? 'Branch updated successfully.' : 'Branch created successfully.');
      setFormModalVisible(false);
      fetchBranches();
    } catch (error) {
      console.error('Form submit error:', error.message);
      Alert.alert('Error', error.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRefresh = () => {
    fetchBranches();
    fetchUsers();
  };

  // Filter — by search + type selector
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.branch_address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'All Branch' ||
      b.branch_type === filterType;
    return matchesSearch && matchesType;
  });

  if (user?.role !== 'Admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="lock-closed" size={80} color="#D00D14" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            You do not have administrative privileges to manage branches. Please contact system support.
          </Text>
          <TouchableOpacity style={styles.backHomeButton} onPress={() => router.replace('/(app)')}>
            <Text style={styles.backHomeButtonText}>Back to Dashboard</Text>
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
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} colors={['#D00D14']} />
        }
      >
        {/* Screen Title & Back Button */}
        <View style={styles.titleSection}>
          <BackButton />
          <View style={styles.titleTextContainer}>
            <Text style={styles.screenTitle}>Branch Monitoring</Text>
            <Text style={styles.screenSubtitle}>Track your branches and analytics</Text>
          </View>
          <TouchableOpacity
            style={styles.headerFab}
            onPress={() => { setFormMode('add'); setFormModalVisible(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="rgba(0,0,0,0.35)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Branch"
            placeholderTextColor="rgba(0,0,0,0.35)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="rgba(0,0,0,0.35)" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Row — horizontally scrollable so chips never overflow */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {['All Branch', 'Company-Owned', 'Franchise'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                filterType === type && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(type)}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.filterChipText,
                filterType === type && styles.filterChipTextActive,
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Branch List */}
        <View style={styles.listContainer}>
          {filteredBranches.length > 0 ? (
            filteredBranches.map((item) => (
              <BranchCard
                key={item.branch_id}
                item={item}
                onViewDetails={handleViewBranch}
                onOpenOptions={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="business-outline" size={36} color="rgba(0,0,0,0.15)" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No branches match your search.' : 'No branches registered yet.'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB hidden — add is in the header now */}

      {/* ITEM ACTION OPTIONS POPUP */}
      <Modal
        visible={optionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <Pressable style={styles.optionsOverlay} onPress={() => setOptionsVisible(false)}>
          <View style={[styles.optionsPopup, { top: popupY }]}>
            <TouchableOpacity style={styles.optionItem} onPress={handleViewBranch} activeOpacity={0.7}>
              <Text style={styles.optionText}>View Details</Text>
              <Ionicons name="information-circle-outline" size={18} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleEditBranch} activeOpacity={0.7}>
              <Text style={styles.optionText}>Edit Details</Text>
              <Ionicons name="pencil-outline" size={16} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleUpdateStatus} activeOpacity={0.7}>
              <Text style={styles.optionText}>
                {selectedBranch?.branch_status === 'Active' ? 'Deactivate' : 'Activate'}
              </Text>
              <Ionicons
                name={selectedBranch?.branch_status === 'Active' ? 'ban-outline' : 'checkmark-circle-outline'}
                size={16}
                color="#000"
              />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleDeleteBranch} activeOpacity={0.7}>
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>Remove Store</Text>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* FORM MODAL (Add/Edit) */}
      <BranchFormModal
        visible={formModalVisible}
        mode={formMode}
        initialData={selectedBranch}
        users={users}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModalVisible(false)}
      />

      {/* DETAIL VIEW MODAL */}
      <BranchDetailModal
        visible={detailModalVisible}
        selectedBranch={selectedBranch}
        users={users}
        onClose={() => setDetailModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  // ── Title section ──────────────────────────────
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
    color: 'rgba(0,0,0,0.45)',
    fontWeight: '500',
    marginTop: 3,
  },
  headerFab: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D00D14',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D00D14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 2,
  },

  // ── Search ─────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },

  // ── Filter chips ───────────────────────────────
  filterRow: {
    marginBottom: 18,
  },
  filterRowContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#D00D14',
    borderColor: '#D00D14',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  // ── List ───────────────────────────────────────
  listContainer: {},
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '600',
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionsPopup: {
    position: 'absolute',
    right: 20,
    width: 160,
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