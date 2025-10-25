import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { FlatList, View, Dimensions, ViewToken, Pressable, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getPublicVideos } from '../lib/queries';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuthStore } from '../hooks/useAuthStore';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const { data, isLoading } = useQuery({ 
    queryKey: ['videos'], 
    queryFn: getPublicVideos 
  });

  // Pause all videos when screen loses focus
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>💃</Text>
          <Text style={styles.loadingText}>Loading amazing dances...</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingProgress} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Glassmorphism */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>💃</Text>
            <Text style={styles.headerTitle}>DanceVerse</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable onPress={() => router.push('/upload')} style={styles.iconButton}>
              <Text style={styles.iconText}>📤</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/leaderboard')} style={styles.iconButton}>
              <Text style={styles.iconText}>🏆</Text>
            </Pressable>
            {userId ? (
              <Pressable onPress={() => router.push('/auth')} style={styles.profileButton}>
                <Text style={styles.profileIcon}>👤</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push('/auth')} style={styles.loginButton}>
                <Text style={styles.loginText}>Login</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Video Feed */}
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoPlayer 
            video={item} 
            isActive={index === activeVideoIndex && isScreenFocused} 
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        initialNumToRender={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '60%',
    height: '100%',
    backgroundColor: '#9333ea',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconText: {
    fontSize: 20,
  },
  profileButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  profileIcon: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
