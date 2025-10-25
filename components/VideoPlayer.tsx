import { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';
import type { VideoMeta } from '../lib/queries';

type VideoPlayerProps = {
  video: VideoMeta;
  isActive: boolean;
};

const { height } = Dimensions.get('window');

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/\s]+)/,
    /youtube\.com\/shorts\/([^&\?\/\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Helper function to check if URL is a YouTube link
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Helper function to convert Google Drive share link to direct video URL
function convertGoogleDriveUrl(url: string): string {
  // Check if it's a Google Drive link
  if (!url.includes('drive.google.com')) {
    return url;
  }

  // Extract file ID from various Google Drive URL formats
  let fileId = null;
  
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const viewMatch = url.match(/\/file\/d\/([^\/]+)/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  // If we found a file ID, convert to direct download URL
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Return original URL if we couldn't convert it
  return url;
}

export function VideoPlayer({ video, isActive }: VideoPlayerProps) {
  // Generate stable random values using useMemo to prevent re-randomization
  const initialLikes = useMemo(() => Math.floor(Math.random() * 5000) + 500, [video.id]);
  const commentsCount = useMemo(() => Math.floor(Math.random() * 500) + 50, [video.id]);
  const sharesCount = useMemo(() => Math.floor(Math.random() * 200) + 20, [video.id]);
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimation] = useState(new Animated.Value(1));
  const [webViewKey, setWebViewKey] = useState(0);
  const [webViewError, setWebViewError] = useState(false);
  
  // Check if this is a YouTube video
  const isYouTube = useMemo(() => isYouTubeUrl(video.url), [video.url]);
  const youtubeVideoId = useMemo(() => isYouTube ? getYouTubeVideoId(video.url) : null, [video.url, isYouTube]);
  
  // Convert Google Drive URLs to direct video URLs
  const videoUrl = useMemo(() => convertGoogleDriveUrl(video.url), [video.url]);
  
  const player = useVideoPlayer(!isYouTube ? videoUrl : '', (player) => {
    player.loop = true;
    player.muted = false;
  });

  // Debug logging
  useEffect(() => {
    console.log('Original URL:', video.url);
    console.log('Converted URL:', videoUrl);
    console.log('Is YouTube:', isYouTube);
    console.log('YouTube ID:', youtubeVideoId);
  }, [video.url, videoUrl, isYouTube, youtubeVideoId]);
  
  // Reload WebView when active state changes for YouTube
  useEffect(() => {
    if (isYouTube && youtubeVideoId) {
      setWebViewKey(prev => prev + 1);
    }
  }, [isActive, isYouTube, youtubeVideoId]);

  useEffect(() => {
    if (!player) return;
    
    try {
      if (isActive) {
        player.play();
      } else {
        player.pause();
      }
    } catch (error) {
      // Ignore if player is released
    }

    // Cleanup on unmount
    return () => {
      try {
        if (player && typeof player.pause === 'function') {
          player.pause();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [isActive, player]);

  const toggleLike = () => {
    // Animate the like button
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Video Player */}
      {isYouTube && youtubeVideoId ? (
        // YouTube video embedded in WebView
        <View style={styles.videoContainer}>
          <WebView
            key={webViewKey}
            style={styles.video}
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <style>
                      * { margin: 0; padding: 0; overflow: hidden; }
                      html, body { width: 100%; height: 100%; background: #000; }
                      .video-container { 
                        position: relative; 
                        width: 100%; 
                        height: 100%; 
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #000;
                      }
                      iframe { 
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        pointer-events: auto;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="video-container">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&fs=0&iv_load_policy=3&cc_load_policy=0&enablejsapi=1"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        frameborder="0"
                      ></iframe>
                    </div>
                  </body>
                </html>
              `
            }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            scrollEnabled={false}
            bounces={false}
            originWhitelist={['*']}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            onError={() => setWebViewError(true)}
            onHttpError={() => setWebViewError(true)}
          />
          {webViewError && (
            <View style={styles.youtubeError}>
              <Text style={styles.youtubeErrorEmoji}>⚠️</Text>
              <Text style={styles.youtubeErrorText}>
                YouTube video cannot be embedded
              </Text>
              <Text style={styles.youtubeErrorHint}>
                Try using a direct video URL instead
              </Text>
            </View>
          )}
          {/* Gradient Overlays for YouTube */}
          <View style={styles.topGradient} pointerEvents="none" />
          <View style={styles.bottomGradient} pointerEvents="none" />
        </View>
      ) : (
        // Regular video player
        <Pressable onPress={togglePlayPause} style={styles.videoContainer}>
          <VideoView 
            player={player} 
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
          />
          {/* Gradient Overlays */}
          <View style={styles.topGradient} />
          <View style={styles.bottomGradient} />
        </Pressable>
      )}

      {/* Video Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.videoInfo}>
          <Text style={styles.username}>@dancer_{video.id}</Text>
          <Text style={styles.title}>
            {video.title || '💃 Amazing Dance Performance! #DanceChallenge'}
          </Text>
          <Text style={styles.subtitle}>
            {player.playing ? '▶️ Playing' : '⏸️ Paused'} • Tap to {player.playing ? 'pause' : 'play'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
          <Pressable onPress={toggleLike} style={styles.actionButton}>
            <View style={[styles.iconCircle, isLiked && styles.likedCircle]}>
              <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
            </View>
            <Text style={styles.actionText}>{formatCount(likes)}</Text>
          </Pressable>
        </Animated.View>

        <Pressable style={styles.actionButton}>
          <View style={styles.iconCircle}>
            <Text style={styles.actionIcon}>💬</Text>
          </View>
          <Text style={styles.actionText}>{formatCount(commentsCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <View style={styles.iconCircle}>
            <Text style={styles.actionIcon}>🔗</Text>
          </View>
          <Text style={styles.actionText}>{formatCount(sharesCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <View style={styles.iconCircle}>
            <Text style={styles.actionIcon}>⭐</Text>
          </View>
          <Text style={styles.actionText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 100,
  },
  videoInfo: {
    gap: 6,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    position: 'absolute',
    bottom: 140,
    right: 12,
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(45, 45, 45, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likedCircle: {
    backgroundColor: 'rgba(255, 50, 100, 0.3)',
    borderColor: 'rgba(255, 100, 150, 0.5)',
  },
  actionIcon: {
    fontSize: 26,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  youtubeError: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  youtubeErrorEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  youtubeErrorText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  youtubeErrorHint: {
    color: '#ccc',
    fontSize: 13,
    textAlign: 'center',
  },
});
