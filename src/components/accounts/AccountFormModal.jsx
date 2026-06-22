import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountFormModal({
  visible,
  mode = 'create',
  initialData = null,
  isSubmitting = false,
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.user_name || '');
      setEmail(initialData.user_email || '');
      setPassword(''); // Password optional on edit, so leave blank by default
      setRole(initialData.user_role || 'Staff');
      setStatus(initialData.user_status || 'Active');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Staff');
      setStatus('Active');
    }
  }, [mode, initialData, visible]);

  const handleSubmit = () => {
    onSubmit({
      name,
      email,
      password,
      role,
      status,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'edit' ? 'Edit Account' : 'Create Account'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Modal Form */}
          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Full Name"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.formInput}
              placeholder="email@example.com"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={mode !== 'edit'} // Email is typically read-only during edit in accounts.jsx
            />

            <Text style={styles.inputLabel}>
              {mode === 'edit' ? 'New Password (Optional)' : 'Password'}
            </Text>
            <TextInput
              style={styles.formInput}
              placeholder={mode === 'edit' ? 'Leave blank to keep current' : '••••••••'}
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.chipsRow}>
              {['Franchisee', 'Staff'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, role === r && styles.chipActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.chipText, role === r && styles.chipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.chipsRow}>
              {['Active', 'Pending'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, status === s && styles.chipActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, status === s && styles.chipTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Processing...' : mode === 'edit' ? 'Save Changes' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  closeButton: {
    padding: 2,
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    marginTop: 14,
  },
  formInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  chipActive: {
    backgroundColor: '#D00D14',
    borderColor: '#D00D14',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  chipTextActive: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: '#D00D14',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 12,
    shadowColor: '#D00D14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
