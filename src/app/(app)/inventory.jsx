import React, { useState, useCallback } from 'react';
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

// Modular Imports
import {
  INITIAL_ITEMS,
  CATEGORIES,
  BRANCHES,
  calculateStats,
} from '../../data/mockInventory';

import InventoryStats from '../../components/inventory/InventoryStats';
import InventoryItemCard from '../../components/inventory/InventoryItemCard';
import DropdownFilterModal from '../../components/inventory/DropdownFilterModal';
import InventoryDetailModal from '../../components/inventory/InventoryDetailModal';
import InventoryFormModal from '../../components/inventory/InventoryFormModal';

export default function InventoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();

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
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branch');
  const [statusFilter, setStatusFilter] = useState('Show All');
  const [categoryFilter, setCategoryFilter] = useState('All Category');
  const [isFetching, setIsFetching] = useState(false);

  // Dropdown UI visibility states
  const [branchDropdownVisible, setBranchDropdownVisible] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  // Form Modals visibility
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  // Action targets
  const [selectedItem, setSelectedItem] = useState(null);
  const [popupY, setPopupY] = useState(100);

  const onRefresh = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 1000);
  };

  // Kebab option opening handler
  const handleOpenOptions = (item, event) => {
    const pageY = event?.nativeEvent?.pageY || 100;
    setSelectedItem(item);
    setPopupY(pageY - 15);
    setOptionsVisible(true);
  };

  const handleViewItem = () => {
    setOptionsVisible(false);
    setDetailModalVisible(true);
  };

  const handleEditItem = () => {
    setOptionsVisible(false);
    setFormMode('edit');
    setFormModalVisible(true);
  };

  const handleDeleteItem = () => {
    const item = selectedItem; // snapshot before closing options
    if (!item) return;
    setOptionsVisible(false);
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            Alert.alert('Deleted', 'Item removed successfully.');
          },
        },
      ]
    );
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = (formData) => {
    const { name, type, category, stock, unit, price, branch, status } = formData;

    if (!name.trim() || !stock.trim()) {
      Alert.alert('Validation Error', 'Item Name and Stock amount are required.');
      return;
    }

    const stockNum = parseFloat(stock);
    if (isNaN(stockNum)) {
      Alert.alert('Validation Error', 'Stock must be a valid number.');
      return;
    }

    const priceNum = type === 'product' ? parseFloat(price) : 0;
    if (type === 'product' && isNaN(priceNum)) {
      Alert.alert('Validation Error', 'Price must be a valid number.');
      return;
    }

    if (formMode === 'add') {
      const created = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        category,
        stock: stockNum,
        unit,
        price: priceNum,
        branch,
        status,
        icon: type === 'product' ? 'fast-food-outline' : 'leaf-outline',
        iconColor: status === 'Normal' ? '#34C759' : '#FF9500',
        bgColor: status === 'Normal' ? '#E8F5E9' : '#FFF9F0',
      };
      setItems((prev) => [created, ...prev]);
      Alert.alert('Success', 'Inventory item added successfully.');
    } else {
      // Edit mode — snapshot id to avoid stale closure
      const editId = selectedItem?.id;
      if (!editId) {
        Alert.alert('Error', 'Could not identify item to edit.');
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === editId
            ? {
                ...i,
                name: name.trim(),
                type,
                category,
                stock: stockNum,
                unit,
                price: priceNum,
                branch,
                status,
                iconColor: status === 'Normal' ? '#34C759' : '#FF9500',
                bgColor: status === 'Normal' ? '#E8F5E9' : '#FFF9F0',
              }
            : i
        )
      );
      Alert.alert('Success', 'Item updated successfully.');
    }

    setFormModalVisible(false);
  };

  // Filter items by branch, status and search query
  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = branchFilter === 'All Branch' || i.branch === branchFilter;

    const matchesStatus =
      statusFilter === 'Show All' ||
      (statusFilter === 'Normal' && i.status === 'Normal') ||
      (statusFilter === 'Low Stock' && i.status === 'Low Stock');

    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Split into Products and Ingredients
  const productsList = filteredItems.filter((i) => {
    const isProduct = i.type === 'product';
    const matchesCategory =
      categoryFilter === 'All Category' || i.category === categoryFilter;
    return isProduct && matchesCategory;
  });

  const ingredientsList = filteredItems.filter((i) => i.type === 'ingredient');

  // Compute Stats
  const currentStats = calculateStats(filteredItems);

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
            <Text style={styles.screenTitle}>Inventory Management</Text>
            <Text style={styles.screenSubtitle}>Track and Manage Inventory</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(0, 0, 0, 0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Items/Ingredients"
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

        {/* Filters Selectors Row */}
        <View style={styles.selectorsRow}>
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setBranchDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{branchFilter}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setStatusDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{statusFilter}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Statistics Component */}
        <Text style={styles.sectionHeader}>Overview</Text>
        <InventoryStats stats={currentStats} />

        {/* Products List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeader}>Products List</Text>
          <TouchableOpacity
            style={styles.categoryDropdown}
            onPress={() => setCategoryDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryDropdownText}>{categoryFilter}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Products Cards */}
        <View style={styles.listContainer}>
          {productsList.length > 0 ? (
            productsList.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onOptionsPress={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        </View>

        {/* Ingredients Header & Cards */}
        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Ingredients</Text>
        <View style={styles.listContainer}>
          {ingredientsList.length > 0 ? (
            ingredientsList.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onOptionsPress={handleOpenOptions}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No ingredients found.</Text>
            </View>
          )}
        </View>

        {/* Bottom spacer for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setFormMode('add');
          setFormModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* BRANCH SELECTOR MODAL */}
      <DropdownFilterModal
        visible={branchDropdownVisible}
        title="Select Branch"
        options={['All Branch', ...BRANCHES]}
        selectedOption={branchFilter}
        onSelect={(val) => {
          setBranchFilter(val);
          setBranchDropdownVisible(false);
        }}
        onClose={() => setBranchDropdownVisible(false)}
      />

      {/* STATUS SELECTOR MODAL */}
      <DropdownFilterModal
        visible={statusDropdownVisible}
        title="Filter Stock Level"
        options={['Show All', 'Normal', 'Low Stock']}
        selectedOption={statusFilter}
        onSelect={(val) => {
          setStatusFilter(val);
          setStatusDropdownVisible(false);
        }}
        onClose={() => setStatusDropdownVisible(false)}
      />

      {/* CATEGORY SELECTOR MODAL */}
      <DropdownFilterModal
        visible={categoryDropdownVisible}
        title="Select Category"
        options={['All Category', ...CATEGORIES]}
        selectedOption={categoryFilter}
        onSelect={(val) => {
          setCategoryFilter(val);
          setCategoryDropdownVisible(false);
        }}
        onClose={() => setCategoryDropdownVisible(false)}
      />

      {/* ITEM ACTION OPTIONS POPUP */}
      <Modal
        visible={optionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <Pressable style={styles.optionsOverlay} onPress={() => setOptionsVisible(false)}>
          <View style={[styles.optionsPopup, { top: popupY }]}>
            <TouchableOpacity style={styles.optionItem} onPress={handleViewItem} activeOpacity={0.7}>
              <Text style={styles.optionText}>View Details</Text>
              <Ionicons name="information-circle-outline" size={18} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleEditItem} activeOpacity={0.7}>
              <Text style={styles.optionText}>Edit Item</Text>
              <Ionicons name="pencil-outline" size={16} color="#000" />
            </TouchableOpacity>

            <View style={styles.optionDivider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleDeleteItem} activeOpacity={0.7}>
              <Text style={[styles.optionText, { color: '#FF3B30' }]}>Remove Item</Text>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ADD/EDIT ITEM MODAL */}
      <InventoryFormModal
        visible={formModalVisible}
        mode={formMode}
        initialData={selectedItem}
        onSubmit={handleFormSubmit}
        onClose={() => setFormModalVisible(false)}
      />

      {/* ITEM DETAIL MODAL */}
      <InventoryDetailModal
        visible={detailModalVisible}
        selectedItem={selectedItem}
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
    marginBottom: 16,
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
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 40,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    marginBottom: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDropdown: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    minWidth: 120,
  },
  categoryDropdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginRight: 6,
  },
  listContainer: {},
  emptyCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D00D14',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
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
});
