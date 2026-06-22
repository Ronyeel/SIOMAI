import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountDetailModal({ visible, selectedUser, onClose }) {
  if (!selectedUser) return null;

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
            <Text style={styles.modalTitle}>Account Specifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Details Body */}
          <View style={styles.viewDetailsBody}>
            <View style={styles.viewAvatarContainer}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {selectedUser.user_name ? selectedUser.user_name.slice(0, 2).toUpperCase() : 'U'}
                </Text>
              </View>
              <Text style={styles.viewDetailName}>{selectedUser.user_name}</Text>
              
              <View
                style={[
                  styles.roleTag,
                  selectedUser.user_role === 'Admin' ? styles.tagAdminBg : styles.tagStaffBg,
                  { marginTop: 6 },
                ]}
              >
                <Text
                  style={[
                    styles.roleTagText,
                    selectedUser.user_role === 'Admin' ? styles.tagAdminText : styles.tagStaffText,
                  ]}
                >
                  {selectedUser.user_role}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{selectedUser.user_email}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusTag,
                  selectedUser.user_status === 'Active' ? styles.statusActiveBg : styles.statusPendingBg,
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    selectedUser.user_status === 'Active' ? styles.statusActiveText : styles.statusPendingText,
                  ]}
                >
                  {selectedUser.user_status}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created At</Text>
              <Text style={styles.detailValue}>
                {selectedUser.user_created_at
                  ? new Date(selectedUser.user_created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </Text>
            </View>
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
    backgroundColor: '#D00D14',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarLargeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  viewDetailName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagAdminBg: {
    backgroundColor: '#FFF5F5',
  },
  tagStaffBg: {
    backgroundColor: '#F1F1F1',
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tagAdminText: {
    color: '#D00D14',
  },
  tagStaffText: {
    color: '#555',
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
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
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
});
