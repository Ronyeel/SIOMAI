import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency } from '../../data/mockInventory';

/**
 * Displays all details of a selected inventory item in a modal.
 */
export default function InventoryDetailModal({ visible, selectedItem, onClose }) {
  if (!selectedItem) return null;

  const isLowStock = selectedItem.status === 'Low Stock';

  const rows = [
    { label: 'Type', value: selectedItem.type === 'product' ? 'Product' : 'Ingredient' },
    { label: 'Category', value: selectedItem.category },
    { label: 'Branch', value: selectedItem.branch },
    { label: 'Stock', value: `${selectedItem.stock} ${selectedItem.unit}` },
    ...(selectedItem.type === 'product' && selectedItem.price > 0
      ? [{ label: 'Unit Price', value: formatCurrency(selectedItem.price) }]
      : []),
    ...(selectedItem.type === 'product' && selectedItem.price > 0
      ? [{ label: 'Total Value', value: formatCurrency(selectedItem.price * selectedItem.stock) }]
      : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Item Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Item Name + Status Banner */}
            <View style={styles.itemBanner}>
              <View style={[styles.iconBg, { backgroundColor: selectedItem.bgColor }]}>
                <Ionicons name={selectedItem.icon} size={28} color={selectedItem.iconColor} />
              </View>
              <Text style={styles.itemName}>{selectedItem.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isLowStock ? styles.statusLowBg : styles.statusNormalBg,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isLowStock ? styles.statusLowText : styles.statusNormalText,
                  ]}
                >
                  {selectedItem.status}
                </Text>
              </View>
            </View>

            {/* Detail Rows */}
            {rows.map((row, idx) => (
              <View key={idx} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '92%',
    maxHeight: '80%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  closeBtn: {
    padding: 2,
  },
  itemBanner: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusNormalBg: { backgroundColor: '#E2FBE9' },
  statusLowBg: { backgroundColor: '#FFF0E2' },
  statusText: { fontSize: 11, fontWeight: '800' },
  statusNormalText: { color: '#198754' },
  statusLowText: { color: '#FF9500' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.45)',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    maxWidth: '55%',
    textAlign: 'right',
  },
});
