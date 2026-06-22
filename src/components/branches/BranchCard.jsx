import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BranchCard({ item, onOpenOptions }) {
  const getInitials = (name) => {
    if (!name) return 'B';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {/* Branch Icon Placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.branch_name)}</Text>
        </View>

        {/* Info Column */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.branch_name}
            </Text>
            <View
              style={[
                styles.typeTag,
                item.branch_type === 'Company-Owned' ? styles.tagCompanyBg : styles.tagFranchiseBg,
              ]}
            >
              <Text
                style={[
                  styles.typeTagText,
                  item.branch_type === 'Company-Owned' ? styles.tagCompanyText : styles.tagFranchiseText,
                ]}
              >
                {item.branch_type}
              </Text>
            </View>
          </View>

          <Text style={styles.address} numberOfLines={1}>
            {item.branch_address}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.contactContainer}>
              <Ionicons name="call-outline" size={12} color="rgba(0, 0, 0, 0.4)" />
              <Text style={styles.contactText}>
                {item.branch_contact_number || 'No contact number'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.branch_status === 'Active' ? '#34C759' : '#FF9500' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: item.branch_status === 'Active' ? '#198754' : '#FF9500' },
                ]}
              >
                {item.branch_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Menu Trigger */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={(e) => onOpenOptions(item, e)}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="rgba(0, 0, 0, 0.4)" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#120504',
    borderWidth: 1,
    borderColor: '#E90000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#E90000',
    fontWeight: '800',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    maxWidth: '65%',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagCompanyBg: {
    backgroundColor: '#FFF0F0',
  },
  tagFranchiseBg: {
    backgroundColor: '#F0F5FF',
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tagCompanyText: {
    color: '#D00D14',
  },
  tagFranchiseText: {
    color: '#0055FF',
  },
  address: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
  },
});
