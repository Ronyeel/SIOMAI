import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashView({ isLoading, onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;      // Content fade & scale
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const containerFade = useRef(new Animated.Value(1)).current;  // Outward fade of entire splash screen

  useEffect(() => {
    // 1. Fade in and scale up the content on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Wait until loading is complete, and guarantee a minimum display time of 1.8 seconds
    const minTimer = setTimeout(() => {
      checkAndExit();
    }, 1800);

    return () => clearTimeout(minTimer);
  }, []);

  // Watch for loading change
  useEffect(() => {
    if (!isLoading) {
      checkAndExit();
    }
  }, [isLoading]);

  const checkAndExit = () => {
    // Only exit if the app has finished loading the authentication session
    if (isLoading) return;

    // Fade out the splash screen container, then call onFinish
    Animated.timing(containerFade, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#D00D14', '#5C0000', '#0F0001', '#000000']}
        locations={[0, 0.45, 0.8, 1]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo image */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../assets/images/siomai_street_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>SIOMAI STREET</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>Siomai Sarap, Siomai Sulit</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 25,
  },
  logo: {
    width: width * 0.46,
    height: width * 0.46,
    borderRadius: (width * 0.46) / 2,
  },
  title: {
    fontSize: 50,
    color: '#FFF',
    fontFamily: 'Cookie-Regular',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.95,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
