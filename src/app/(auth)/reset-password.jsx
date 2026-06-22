import React, { useState, useRef } from 'react';
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
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '../../components/Button';
import { AuthService } from '../../services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  const handleChangeText = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await AuthService.verifyResetCode(email, verificationCode);
      
      Alert.alert(
        'Success',
        'Verification successful! You can now change your password.',
        [{ 
          text: 'OK', 
          onPress: () => router.push({ pathname: '/(auth)/change-password', params: { email } }) 
        }]
      );
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
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
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  A 6-digit verification code has been{"\n"}
                  sent to your email. Enter the code{"\n"}
                  below to continue resetting your{"\n"}
                  password
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Form Error Alert */}
                {error ? (
                  <View style={styles.errorAlert}>
                    <Ionicons name="alert-circle-outline" size={18} color="#FFD2D2" style={styles.errorIcon} />
                    <Text style={styles.errorAlertText}>{error}</Text>
                  </View>
                ) : null}

                {/* 6-Digit Code Inputs */}
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={styles.codeInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChangeText(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      placeholder={(index + 1).toString()}
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {/* Verify Code Button */}
                <Button
                  title="Verify Code"
                  onPress={handleVerifyCode}
                  isLoading={isLoading}
                  activityColor="#FFF"
                  style={styles.resetButton}
                  textStyle={styles.resetButtonText}
                />
              </View>

              {/* Footer */}
              <View style={styles.footerSection}>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Global / General
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

  // OTP Verification Layout (Full Gradient)
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
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
    marginBottom: 35,
  },
  formSection: {
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 35,
  },
  codeInput: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3C0002',
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#E90000',
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
  footerSection: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
