import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '../Button';

export default function BranchFormModal({ visible, mode, initialData, users = [], onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [type, setType] = useState('Company-Owned');
  const [status, setStatus] = useState('Active');
  const [managerId, setManagerId] = useState('');
  const [managerDropdownVisible, setManagerDropdownVisible] = useState(false);

  // Sync state with initialData on edit
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialData) {
        setName(initialData.branch_name || '');
        setAddress(initialData.branch_address || '');
        setContactNumber(initialData.branch_contact_number || '');
        setType(initialData.branch_type || 'Company-Owned');
        setStatus(initialData.branch_status || 'Active');
        setManagerId(initialData.branch_manager_id ? String(initialData.branch_manager_id) : '');
      } else {
        setName('');
        setAddress('');
        setContactNumber('');
        setType('Company-Owned');
        setStatus('Active');
        setManagerId('');
      }
      setManagerDropdownVisible(false);
    }
  }, [visible, mode, initialData]);

  const handleSubmit = () => {
    onSubmit({
      name,
      address,
      contactNumber,
      type,
      status,
      managerId: managerId ? parseInt(managerId) : null,
    });
  };

  const getSelectedManagerName = () => {
    if (!managerId) return 'Select Manager (Optional)';
    const mgr = users.find(u => String(u.user_id) === managerId);
    return mgr ? mgr.user_name : 'Select Manager (Optional)';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'add' ? 'Create New Branch' : 'Modify Branch Specifications'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
            {/* Branch Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Branch Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter branch name"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                placeholder="Enter branch address"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                value={address}
                onChangeText={setAddress}
                multiline={true}
                numberOfLines={2}
              />
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. +639123456789"
                placeholderTextColor="rgba(0, 0, 0, 0.3)"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
              />
            </View>

            {/* Branch Type Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Branch Type *</Text>
              <View style={styles.selectorRow}>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    type === 'Company-Owned' && styles.selectorActive,
                  ]}
                  onPress={() => setType('Company-Owned')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      type === 'Company-Owned' && styles.selectorTextActive,
                    ]}
                  >
                    Company-Owned
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    type === 'Franchise' && styles.selectorActive,
                  ]}
                  onPress={() => setType('Franchise')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      type === 'Franchise' && styles.selectorTextActive,
                    ]}
                  >
                    Franchise
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status *</Text>
              <View style={styles.selectorRow}>
                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    status === 'Active' && styles.selectorActive,
                  ]}
                  onPress={() => setStatus('Active')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      status === 'Active' && styles.selectorTextActive,
                    ]}
                  >
                    Active
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.selectorButton,
                    status === 'Inactive' && styles.selectorActive,
                  ]}
                  onPress={() => setStatus('Inactive')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      status === 'Inactive' && styles.selectorTextActive,
                    ]}
                  >
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Manager Selection Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Assigned Manager</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setManagerDropdownVisible(!managerDropdownVisible)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownButtonText, !managerId && styles.placeholderText]}>
                  {getSelectedManagerName()}
                </Text>
                <Ionicons
                  name={managerDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="rgba(0, 0, 0, 0.4)"
                />
              </TouchableOpacity>

              {managerDropdownVisible && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setManagerId('');
                      setManagerDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>None (Unassigned)</Text>
                  </TouchableOpacity>
                  {users.map(u => (
                    <TouchableOpacity
                      key={u.user_id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setManagerId(String(u.user_id));
                        setManagerDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {u.user_name} ({u.user_role})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Button
              title={mode === 'add' ? 'Create Branch' : 'Save Changes'}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#000',
  },
  closeButton: {
    padding: 2,
  },
  formBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 18,
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  multilineInput: {
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorActive: {
    backgroundColor: '#D00D14',
    borderColor: '#D00D14',
  },
  selectorText: {
    fontSize: 13,
    fontWeight: '850',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  selectorTextActive: {
    color: '#FFF',
  },
  dropdownButton: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  placeholderText: {
    color: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 180,
    overflow: 'scroll',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#D00D14',
    borderColor: '#D00D14',
    borderWidth: 0,
    borderRadius: 12,
    height: 50,
    marginTop: 20,
  },
});
