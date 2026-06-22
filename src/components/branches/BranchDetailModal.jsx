import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BranchDetailModal({ visible, selectedBranch, users = [], onClose }) {
  if (!selectedBranch) return null;

  // Resolve manager details
  const manager = users.find(u => u.user_id === selectedBranch.branch_manager_id);
  const managerName = manager ? manager.user_name : 'No Manager Assigned';
  const managerEmail = manager ? manager.user_email : 'N/A';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Branch Specifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Details Body */}
          <View style={styles.viewDetailsBody}>
            <View style={styles.viewAvatarContainer}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {selectedBranch.branch_name ? selectedBranch.branch_name.slice(0, 2).toUpperCase() : 'BR'}
                </Text>
              </View>
              <Text style={styles.viewDetailName}>{selectedBranch.branch_name}</Text>
              
              <View
                style={[
                  styles.typeTag,
                  selectedBranch.branch_type === 'Company-Owned' ? styles.tagCompanyBg : styles.tagFranchiseBg,
                  { marginTop: 6 },
                ]}
              >
                <Text
                  style={[
                    styles.typeTagText,
                    selectedBranch.branch_type === 'Company-Owned' ? styles.tagCompanyText : styles.tagFranchiseText,
                  ]}
                >
                  {selectedBranch.branch_type}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text numberOfLines={2} style={[styles.detailValue, styles.addressValue]}>
                {selectedBranch.branch_address}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Contact Number</Text>
              <Text style={styles.detailValue}>
                {selectedBranch.branch_contact_number || 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusTag,
                  selectedBranch.branch_status === 'Active' ? styles.statusActiveBg : styles.statusPendingBg,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    selectedBranch.branch_status === 'Active' ? styles.statusActiveText : styles.statusPendingText,
                  ]}
                >
                  {selectedBranch.branch_status}
                </Text>
              </View>
            </View>

            {/* Manager Details */}
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionDividerText}>Manager Information</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned Manager</Text>
              <Text style={styles.detailValue}>{managerName}</Text>
            </View>

            {manager && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Manager Email</Text>
                <Text style={styles.detailValue}>{managerEmail}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '90%',
    paddingBottom: 24,
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
  closeButton: {
    padding: 2,
  },
  viewDetailsBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  viewAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#120504',
    borderWidth: 1.5,
    borderColor: '#E90000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarLargeText: {
    color: '#E90000',
    fontSize: 20,
    fontWeight: '800',
  },
  viewDetailName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagCompanyBg: {
    backgroundColor: '#FFF5F5',
  },
  tagFranchiseBg: {
    backgroundColor: '#F1F1F1',
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tagCompanyText: {
    color: '#D00D14',
  },
  tagFranchiseText: {
    color: '#0055FF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    textAlign: 'right',
  },
  addressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    textAlign: 'right',
    maxWidth: '70%',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActiveBg: {
    backgroundColor: '#E2FBE9',
  },
  statusPendingBg: {
    backgroundColor: '#FFF0E2',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusActiveText: {
    color: '#198754',
  },
  statusPendingText: {
    color: '#FF9500',
  },
  sectionDivider: {
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingBottom: 4,
  },
  sectionDividerText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0, 0, 0, 0.4)',
  },
});
