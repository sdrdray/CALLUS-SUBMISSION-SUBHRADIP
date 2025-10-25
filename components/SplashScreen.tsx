import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 2,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#9333ea', '#7c3aed', '#6d28d9']}
      style={styles.container}
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
        {/* Rotating gradient circle */}
        <Animated.View
          style={[
            styles.circleBackground,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <LinearGradient
            colors={['#ec4899', '#8b5cf6', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCircle}
          />
        </Animated.View>

        {/* App Icon/Logo */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.iconEmoji}>💃</Text>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>Dance Battle</Text>
        <Text style={styles.tagline}>Compete. Create. Conquer.</Text>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1.1, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
        </View>

        <Text style={styles.loadingText}>Loading your stage...</Text>
      </Animated.View>

      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingShape,
              {
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
                transform: [
                  {
                    translateY: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0, (i % 2 === 0 ? -20 : 20)],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.shapeEmoji}>
              {['✨', '🎵', '🎤', '🎬', '⭐', '🔥'][i]}
            </Text>
          </Animated.View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circleBackground: {
    position: 'absolute',
    width: 280,
    height: 280,
    top: -40,
  },
  gradientCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    opacity: 0.3,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconEmoji: {
    fontSize: 70,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 60,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  decorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  floatingShape: {
    position: 'absolute',
    opacity: 0.4,
  },
  shapeEmoji: {
    fontSize: 32,
  },
});
