import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { AuthService } from '../../services/authService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await AuthService.updatePassword(email, newPassword);
      
      Alert.alert(
        'Success',
        'Password has been reset successfully. You can now log in with your new password.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.curvedMainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#D00D14" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.curvedScrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top red curved header card */}
          <LinearGradient
            colors={['#D00D14', '#5C0000']}
            style={styles.topCard}
          >
            {/* Header row — back arrow + logo */}
            <View style={styles.headerRowCurved}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="chevron-back" size={24} color="#E90000" />
              </TouchableOpacity>

              <Image
                source={require('../../../assets/images/siomai_street_logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <View style={styles.titleSectionCurved}>
              <Text style={styles.curvedTitle}>Change{"\n"}Account{"\n"}Password</Text>
            </View>
          </LinearGradient>

          {/* Bottom section (dark background) */}
          <View style={styles.curvedBottomSection}>
            {/* Form Error Alert */}
            {error ? (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#FFD2D2" style={styles.errorIcon} />
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}

            {/* Enter New Password */}
            <Input
              placeholder="Enter New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.inputFieldCurved}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.8)" />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirm Password */}
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.inputFieldCurved}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.8)" />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                </TouchableOpacity>
              }
            />

            {/* Change Password Button */}
            <Button
              title="Change Password"
              onPress={handleUpdatePassword}
              isLoading={isLoading}
              activityColor="#FFF"
              style={styles.changePasswordButton}
              textStyle={styles.changePasswordButtonText}
            />

            {/* Footer */}
            <View style={styles.footerSectionCurved}>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                style={styles.backToLoginButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color="#FFF" style={styles.backToLoginIcon} />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToLoginIcon: {
    marginRight: 8,
  },
  backToLoginText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#750005',
    borderWidth: 1,
    borderColor: '#FF4D4D',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    width: '100%',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorAlertText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#120504',
    borderWidth: 1.5,
    borderColor: '#E90000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#E90000',
  },
  curvedMainContainer: {
    flex: 1,
    backgroundColor: '#120504',
  },
  curvedScrollContent: {
    flexGrow: 1,
    backgroundColor: '#120504',
  },
  topCard: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 28,
    paddingBottom: 40,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  headerRowCurved: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  titleSectionCurved: {
    marginBottom: 10,
  },
  curvedTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 38,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  curvedBottomSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputFieldCurved: {
    backgroundColor: '#0D0000',
    borderColor: '#E90000',
    borderWidth: 1.5,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
  },
  inputText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  changePasswordButton: {
    backgroundColor: '#FF0039',
    borderColor: '#FF0039',
    borderWidth: 0,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '75%',
    marginTop: 20,
    shadowColor: '#FF0039',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  changePasswordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerSectionCurved: {
    marginTop: 40,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
