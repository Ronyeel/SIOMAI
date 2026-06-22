import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * BranchCard — matches the Branch Performance Monitoring card design.
 * Financial stats (sales, orders, profit) are shown as '—' until a
 * reporting API is wired in; all branch metadata is real.
 */
export default function BranchCard({ item, onViewDetails, onOpenOptions }) {
  const isOpen = item.branch_status === 'Active';

  const renderStars = (count = 4) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < count ? 'star' : 'star-outline'}
        size={11}
        color={i < count ? '#F4A623' : '#CCC'}
      />
    ));
  };

  return (
    <View style={styles.card}>
      {/* ── Top Row ─────────────────────────────────── */}
      <View style={styles.topRow}>
        <View style={styles.nameBlock}>
          <Text style={styles.branchName} numberOfLines={1}>
            {item.branch_name}
          </Text>
          <View style={[styles.statusBadge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            <View style={[styles.statusDot, isOpen ? styles.dotOpen : styles.dotClosed]} />
            <Text style={[styles.statusText, isOpen ? styles.textOpen : styles.textClosed]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => onViewDetails(item)} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => onOpenOptions(item, e)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={14} color="rgba(0,0,0,0.4)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Address ─────────────────────────────────── */}
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={12} color="rgba(0,0,0,0.4)" />
        <Text style={styles.addressText} numberOfLines={1}>
          {item.branch_address}
        </Text>
      </View>

      {/* ── Divider ─────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Primary Stats Row ───────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Ionicons name="trending-up-outline" size={11} color="#34C759" />
          </View>
          <Text style={styles.statValue}>—</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>Order Volume</Text>
            <Ionicons name="cube-outline" size={11} color="rgba(0,0,0,0.35)" />
          </View>
          <Text style={styles.statValue}>—</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>Profit Margin</Text>
            <Ionicons name="stats-chart-outline" size={11} color="rgba(0,0,0,0.35)" />
          </View>
          <Text style={styles.statValue}>—</Text>
        </View>
      </View>

      {/* ── Secondary Stats Row ─────────────────────── */}
      <View style={styles.secondaryRow}>
        <View style={styles.secondaryCell}>
          <Text style={styles.secondaryLabel}>Avg. Order Value</Text>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={11} color="rgba(0,0,0,0.4)" />
            <Text style={styles.secondaryValue}>
              {item.branch_contact_number || 'No contact'}
            </Text>
          </View>
        </View>

        <View style={styles.secondaryCell}>
          <Text style={styles.secondaryLabel}>Ratings</Text>
          <View style={styles.starsRow}>
            {renderStars(4)}
            <Text style={styles.ratingNum}>4.0</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  branchName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    maxWidth: '65%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  badgeOpen: {
    backgroundColor: '#E7FAF0',
  },
  badgeClosed: {
    backgroundColor: '#FFF0F0',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotOpen: {
    backgroundColor: '#34C759',
  },
  dotClosed: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textOpen: {
    color: '#1A9E46',
  },
  textClosed: {
    color: '#D00D14',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D00D14',
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.45)',
    fontWeight: '500',
    flex: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginBottom: 12,
  },

  // Primary stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCell: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 6,
  },

  // Secondary stats
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  secondaryCell: {
    flex: 1,
  },
  secondaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  secondaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
  },
});
