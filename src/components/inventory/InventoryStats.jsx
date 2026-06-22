import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '../../data/mockInventory';

/**
 * Renders the 4-cell overview stats grid for the inventory screen.
 */
export default function InventoryStats({ stats = {} }) {
  const {
    totalProducts = 0,
    totalIngredients = 0,
    lowStockCount = 0,
    totalValue = 0,
  } = stats;

  return (
    <View style={styles.statsGrid}>
      <View style={[styles.statCard, styles.statCardRed]}>
        <Text style={styles.statValue}>{totalProducts}</Text>
        <Text style={styles.statLabel}>Total Products</Text>
      </View>

      <View style={[styles.statCard, styles.statCardDark]}>
        <Text style={styles.statValue}>{totalIngredients}</Text>
        <Text style={styles.statLabel}>Ingredients</Text>
      </View>

      <View style={[styles.statCard, styles.statCardOrange]}>
        <Text style={styles.statValue}>{lowStockCount}</Text>
        <Text style={styles.statLabel}>Low Stock</Text>
      </View>

      <View style={[styles.statCard, styles.statCardGreen]}>
        <Text style={[styles.statValue, styles.statValueSmall]}>
          {formatCurrency(totalValue)}
        </Text>
        <Text style={styles.statLabel}>Inventory Value</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
  },
  statCardRed: {
    backgroundColor: '#D00D14',
  },
  statCardDark: {
    backgroundColor: '#1A1A1A',
  },
  statCardOrange: {
    backgroundColor: '#FF9500',
  },
  statCardGreen: {
    backgroundColor: '#34C759',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.3,
  },
});
