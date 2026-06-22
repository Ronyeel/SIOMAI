import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthService } from '../../services/authService';

export default function ProfileTabAccount({ user, onLogout }) {
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwSuccessMsg, setPwSuccessMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccessMsg('');

    if (!currentPassword) {
      setPwError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPw(true);
      await AuthService.changePassword(user.email, currentPassword, newPassword);
      setPwSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setPwSuccessMsg(''), 4000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleConfirmDelete = () => {
    Alert.alert(
      'Request Account Deletion',
      'Please contact your system administrator to permanently delete your account.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Email Card */}
      <View style={styles.infoCard}>
        <Ionicons name="mail-outline" size={20} color="#555" style={styles.infoCardIcon} />
        <Text style={styles.infoCardText}>{user?.email || 'N/A'}</Text>
      </View>

      {/* Role Card */}
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#555" style={styles.infoCardIcon} />
        <Text style={styles.infoCardText}>{user?.role || 'N/A'}</Text>
      </View>

      {/* Change Password Banner */}
      {pwSuccessMsg !== '' && (
        <View style={styles.pwSuccessAlert}>
          <Ionicons name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.pwSuccessText}>{pwSuccessMsg}</Text>
        </View>
      )}

      {/* Password Toggle */}
      <TouchableOpacity
        style={styles.changePasswordToggle}
        onPress={() => {
          setShowPasswordSection(!showPasswordSection);
          setPwError('');
          setPwSuccessMsg('');
        }}
        activeOpacity={0.7}
      >
        <View style={styles.changePasswordToggleLeft}>
          <Ionicons name="key-outline" size={20} color="#555" />
          <Text style={styles.changePasswordToggleText}>Change Password</Text>
        </View>
        <Ionicons
          name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#999"
        />
      </TouchableOpacity>

      {showPasswordSection && (
        <View style={styles.passwordForm}>
          {/* Current Password */}
          <View style={styles.pwField}>
            <Text style={styles.pwFieldLabel}>Current password</Text>
            <View style={styles.pwInputRow}>
              <TextInput
                style={styles.pwInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="rgba(0,0,0,0.25)"
                secureTextEntry={!showCurrentPw}
                editable={!isChangingPw}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPw(!showCurrentPw)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showCurrentPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.pwField}>
            <Text style={styles.pwFieldLabel}>New password</Text>
            <View style={styles.pwInputRow}>
              <TextInput
                style={styles.pwInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor="rgba(0,0,0,0.25)"
                secureTextEntry={!showNewPw}
                editable={!isChangingPw}
              />
              <TouchableOpacity
                onPress={() => setShowNewPw(!showNewPw)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showNewPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.pwField}>
            <Text style={styles.pwFieldLabel}>Confirm new password</Text>
            <View style={styles.pwInputRow}>
              <TextInput
                style={styles.pwInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="rgba(0,0,0,0.25)"
                secureTextEntry={!showConfirmPw}
                editable={!isChangingPw}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPw(!showConfirmPw)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {pwError !== '' && (
            <View style={styles.pwErrorAlert}>
              <Ionicons name="alert-circle" size={16} color="#D00D14" />
              <Text style={styles.pwErrorText}>{pwError}</Text>
            </View>
          )}

          {/* Update PW Button */}
          <TouchableOpacity
            style={[styles.updatePwBtn, isChangingPw && styles.saveBtnDisabled]}
            onPress={handleChangePassword}
            disabled={isChangingPw}
            activeOpacity={0.85}
          >
            {isChangingPw ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.updatePwBtnText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Delete account</Text>
        <Text style={styles.dangerDesc}>
          Your account will be permanently removed from the application. All your data will be lost.
        </Text>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleConfirmDelete}
          activeOpacity={0.85}
        >
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color="#8B0000" style={{ marginRight: 6 }} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  infoCardIcon: {
    marginRight: 12,
  },
  infoCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  pwSuccessAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.25)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 8,
  },
  pwSuccessText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  changePasswordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  changePasswordToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  changePasswordToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  passwordForm: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  pwField: {
    marginBottom: 16,
  },
  pwFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 6,
  },
  pwInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D5D5D5',
    paddingBottom: 8,
  },
  pwInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    padding: 0,
  },
  pwErrorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pwErrorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D00D14',
    flex: 1,
  },
  updatePwBtn: {
    backgroundColor: '#D00D14',
    borderRadius: 28,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatePwBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  dangerSection: {
    marginTop: 20,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dangerDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.45)',
    lineHeight: 17,
    marginBottom: 16,
  },
  deleteBtn: {
    backgroundColor: '#D00D14',
    borderRadius: 28,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#8B0000',
    borderRadius: 28,
    height: 48,
    marginTop: 2,
    marginBottom: 20,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B0000',
  },
});
