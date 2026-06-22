import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatCurrency } from '../../data/mockInventory';

/**
 * Renders a single product or ingredient card in the inventory list.
 */
export default function InventoryItemCard({ item, onOptionsPress }) {
  const isLowStock = item.status === 'Low Stock';

  return (
    <View style={styles.itemCard}>
      {/* Icon Badge */}
      <View style={[styles.itemIconBg, { backgroundColor: item.bgColor }]}>
        <Ionicons name={item.icon} size={22} color={item.iconColor} />
      </View>

      {/* Item Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <View style={styles.itemMetaRow}>
          <Text style={styles.itemStock}>
            {item.stock} {item.unit}
          </Text>
          {item.type === 'product' && item.price > 0 && (
            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          )}
        </View>
      </View>

      {/* Right Side: Status + Options */}
      <View style={styles.itemRight}>
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
            {item.status}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={(event) => onOptionsPress(item, event)}
          activeOpacity={0.6}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 12,
  },
  itemIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemStock: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D00D14',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusNormalBg: {
    backgroundColor: '#E2FBE9',
  },
  statusLowBg: {
    backgroundColor: '#FFF0E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusNormalText: {
    color: '#198754',
  },
  statusLowText: {
    color: '#FF9500',
  },
  optionsButton: {
    padding: 4,
  },
});
