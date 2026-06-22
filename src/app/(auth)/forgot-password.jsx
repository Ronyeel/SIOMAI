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
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthService } from '../../services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setErrors({});
      setIsLoading(true);
      await AuthService.resetPassword(email);
      
      Alert.alert(
        'Code Sent',
        `A 6-digit verification code has been sent to ${email.toLowerCase().trim()}.`,
        [{ text: 'OK', onPress: () => router.push({ pathname: '/(auth)/reset-password', params: { email } }) }]
      );
    } catch (err) {
      setErrors({ form: err.message || 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#D00D14', '#120504', '#060000']}
      locations={[0, 0.6, 1]}
      style={styles.mainContainer}
    >
      <StatusBar barStyle="light-content" backgroundColor="#D00D14" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header row — back arrow + logo */}
            <View style={styles.headerRow}>
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

            {/* Content area */}
            <View style={styles.contentSection}>
              {/* Title Section */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Please enter your email address to{'\n'}
                  request a password reset
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Form Error Alert */}
                {errors.form ? (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle-outline" size={18} color="#FFD2D2" style={styles.errorIcon} />
                    <Text style={styles.errorAlertText}>{errors.form}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <Input
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  style={styles.inputField}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText}
                  leftIcon={<Ionicons name="mail-outline" size={20} color="#FFF" />}
                />

                {/* Reset Password Button */}
                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  isLoading={isLoading}
                  activityColor="#FFF"
                  style={styles.resetButton}
                  textStyle={styles.resetButtonText}
                />
              </View>

              {/* Footer */}
              <View style={styles.footerSection}>
                <TouchableOpacity
                  onPress={() => router.back()}
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 40,
  },

  /* ---- Header ---- */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
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

  /* ---- Content ---- */
  contentSection: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'left',
    opacity: 0.85,
  },

  /* ---- Form ---- */
  formSection: {
    alignItems: 'center',
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
  inputContainer: {
    marginBottom: 25,
    width: '100%',
  },
  inputField: {
    backgroundColor: '#3C0002',
    borderColor: '#E90000',
    borderWidth: 1.5,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
  },
  inputText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#FF334B',
    borderColor: '#FF334B',
    borderWidth: 0,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    shadowColor: '#FF334B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 15,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* ---- Footer ---- */
  footerSection: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
});
