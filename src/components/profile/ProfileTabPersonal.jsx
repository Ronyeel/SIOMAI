import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileTabPersonal({ user, onUpdateProfile }) {
  // Split name into first/last for the Personal tab
  const splitName = (fullName) => {
    if (!fullName) return { first: '', last: '' };
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return { first: parts[0], last: parts.slice(1).join(' ') };
    }
    return { first: parts[0], last: '' };
  };

  const { first: initFirst, last: initLast } = splitName(user?.name);
  const [firstName, setFirstName] = useState(initFirst);
  const [lastName, setLastName] = useState(initLast);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Keep local state in sync if user changes externally
  useEffect(() => {
    const { first, last } = splitName(user?.name);
    setFirstName(first);
    setLastName(last);
  }, [user?.name]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name cannot be empty.');
      return;
    }

    const fullName = lastName.trim()
      ? `${firstName.trim()} ${lastName.trim()}`
      : firstName.trim();

    try {
      setIsSaving(true);
      setSuccessMsg('');
      await onUpdateProfile({ name: fullName });
      setSuccessMsg('Profile updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('[ProfileTabPersonal] Error saving profile:', err);
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionHeading}>Personal Data</Text>

      {/* First Name */}
      <View style={styles.underlineField}>
        <Text style={styles.underlineLabel}>First name</Text>
        <TextInput
          style={styles.underlineInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor="rgba(0,0,0,0.25)"
          editable={!isSaving}
        />
      </View>

      {/* Last Name */}
      <View style={styles.underlineField}>
        <Text style={styles.underlineLabel}>Last name</Text>
        <TextInput
          style={styles.underlineInput}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor="rgba(0,0,0,0.25)"
          editable={!isSaving}
        />
      </View>

      {/* Success Message */}
      {successMsg !== '' && (
        <View style={styles.successAlert}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {/* Save Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  underlineField: {
    marginBottom: 20,
  },
  underlineLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 6,
  },
  underlineInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D5D5D5',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  bottomActions: {
    marginTop: 32,
  },
  saveBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
});
