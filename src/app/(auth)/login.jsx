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
  StatusBar
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setErrors({});
      setIsSubmitting(true);
      await login(email, password);
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E90000" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Top red header section */}
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/siomai_street_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.logoTitle}>SIOMAI STREET</Text>
            
            <Text style={styles.sectionHeading}>LOG IN YOUR ACCOUNT</Text>

            {/* Form Error Alert */}
            {errors.form && (
              <View style={styles.errorAlert}>
                <Ionicons name="alert-circle-outline" size={18} color="#FFD2D2" style={styles.errorIcon} />
                <Text style={styles.errorAlertText}>{errors.form}</Text>
              </View>
            )}

            {/* Reusable Email Field (custom styled) */}
            <Input
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              style={styles.inputField}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              leftIcon={<Ionicons name="person-outline" size={20} color="#FFF" />}
            />

            {/* Reusable Password Field (custom styled) */}
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              style={styles.inputField}
              containerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#FFF" />}
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#FFF" 
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          {/* Bottom dark card section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.forgotButton}
              activeOpacity={0.7}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="LOG IN"
              onPress={handleLogin}
              isLoading={isSubmitting}
              activityColor="#FFF"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D00D14',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 25,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 51,
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: 24,
    color: '#FFF',
    fontFamily: 'Cookie-Regular',
    letterSpacing: 2,
    marginBottom: 35,
    textAlign: 'center',

    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {
    width: 2,
    height: 2,
  },
  textShadowRadius: 6,
  },
  sectionHeading: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'HelveticaNeue-CondensedBold', android: 'sans-serif-condensed' }),
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
    marginBottom: 16,
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
    marginBottom: 18,
    width: '100%',
  },
  inputField: {
    backgroundColor: '#750005', // Mockup input bg color
    borderColor: '#FFF',
    borderWidth: 1,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
  },
  inputText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  eyeIcon: {
    opacity: 0.9,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#120504',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 35,
    paddingHorizontal: 30,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
  },
  forgotButton: {
    marginBottom: 25,
  },
  forgotText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#FF0039', 
    borderColor: '#FF0039',
    borderWidth: 0,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 25,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  signUpText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
