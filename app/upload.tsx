import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuthStore';

export default function UploadScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [title, setTitle] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');

  // Check user authentication on mount
  useEffect(() => {
    if (!userId) {
      console.log('Upload screen: No user ID found');
    }
  }, [userId]);

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select videos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        setUploadMode('file');
      }
    } catch (error: any) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const uploadVideoFile = async () => {
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to upload videos');
      router.push('/auth');
      return;
    }

    if (!videoUri || !title) {
      Alert.alert('Missing info', 'Please add a title and select a video');
      return;
    }

    setUploading(true);

    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      if (!fileInfo.exists) {
        throw new Error('Video file not found');
      }

      // Create unique filename
      const fileExt = videoUri.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, decode(base64), {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Insert metadata into database
      const { error: dbError } = await supabase.from('videos').insert({
        title,
        url: publicUrl,
        user_id: userId,
        is_public: true,
      });

      if (dbError) throw dbError;

      Alert.alert('Success! 🎉', 'Your video has been uploaded and is now live!', [
        { text: 'View Feed', onPress: () => router.push('/') },
        { text: 'Upload Another', onPress: () => {
          setTitle('');
          setVideoUri(null);
          setVideoUrl('');
        }},
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('foreign key constraint')) {
        Alert.alert(
          'Database Error',
          'There was an issue with your account. Please sign out and sign back in, then try again.\n\nTechnical: User ID not found in database.'
        );
      } else {
        Alert.alert('Upload failed', errorMessage + '\n\nPlease try again or use the URL upload mode instead.');
      }
    } finally {
      setUploading(false);
    }
  };

  const uploadVideoUrl = async () => {
    if (!userId) {
      Alert.alert('Sign in required', 'Please sign in to upload videos');
      router.push('/auth');
      return;
    }

    if (!videoUrl || !title) {
      Alert.alert('Missing info', 'Please add a title and video URL');
      return;
    }

    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid video URL starting with http:// or https://');
      return;
    }

    setUploading(true);

    try {
      // Insert video URL directly into database
      const { error } = await supabase.from('videos').insert({
        title,
        url: videoUrl,
        user_id: userId,
        is_public: true,
      });

      if (error) throw error;

      Alert.alert('Success! 🎉', 'Your video has been added to the feed!', [
        { text: 'View Feed', onPress: () => router.push('/') },
        { text: 'Add Another', onPress: () => {
          setTitle('');
          setVideoUri(null);
          setVideoUrl('');
        }},
      ]);
    } catch (error: any) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (uploadMode === 'url') {
      uploadVideoUrl();
    } else {
      uploadVideoFile();
    }
  };

  // Helper function to decode base64
  function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  return (
    <ScrollView style={styles.scroll}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>📤 Upload Video</Text>
          <View style={styles.spacer} />
        </View>
        <Text style={styles.headerSubtitle}>Share your dance with the world</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          {/* Upload Mode Toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeButton, uploadMode === 'url' && styles.modeButtonActive]}
              onPress={() => {
                setUploadMode('url');
                setVideoUri(null);
              }}
            >
              <Text style={[styles.modeButtonText, uploadMode === 'url' && styles.modeButtonTextActive]}>
                🔗 Video URL
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, uploadMode === 'file' && styles.modeButtonActive]}
              onPress={() => {
                setUploadMode('file');
                setVideoUrl('');
              }}
            >
              <Text style={[styles.modeButtonText, uploadMode === 'file' && styles.modeButtonTextActive]}>
                📁 Upload File
              </Text>
            </Pressable>
          </View>

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Video Title *</Text>
            <TextInput
              placeholder="My awesome dance performance"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Video URL Input (if URL mode) */}
          {uploadMode === 'url' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Video URL *</Text>
              <TextInput
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChangeText={setVideoUrl}
                style={styles.input}
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Text style={styles.hint}>
                💡 Best: Direct video URLs or Google Drive public links
              </Text>
              <Text style={styles.hintExample}>
                ✅ Supported:{'\n'}
                • https://example.com/video.mp4{'\n'}
                • Google Drive: Share → Copy link{'\n'}
                • Dropbox: Share → Copy link{'\n'}
                {'\n'}
                📝 Make sure video is publicly accessible!
              </Text>
            </View>
          )}

          {/* Video Picker (if file mode) */}
          {uploadMode === 'file' && (
            <View style={styles.pickerSection}>
              <Text style={styles.label}>Select Video *</Text>
              <Pressable onPress={pickVideo} style={styles.picker}>
                <Text style={styles.pickerEmoji}>🎬</Text>
                <Text style={styles.pickerText}>
                  {videoUri ? '✓ Video Selected' : 'Tap to choose video'}
                </Text>
                {videoUri && (
                  <Text style={styles.pickerHint}>Tap again to change</Text>
                )}
              </Pressable>
              <Text style={styles.hint}>
                📱 Select a dance video from your device
              </Text>
            </View>
          )}

          {/* Upload Button */}
          <Pressable 
            style={[
              styles.uploadButton, 
              (uploading || !title || (uploadMode === 'url' ? !videoUrl : !videoUri)) && styles.uploadButtonDisabled
            ]} 
            onPress={handleUpload}
            disabled={uploading || !title || (uploadMode === 'url' ? !videoUrl : !videoUri)}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? '⏳ Uploading...' : `🚀 ${uploadMode === 'url' ? 'Add Video' : 'Upload Video'}`}
            </Text>
          </Pressable>

          {!userId && (
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Please sign in to upload videos
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#faf5ff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#581c87',
  },
  spacer: {
    width: 32,
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    fontSize: 16,
  },
  pickerSection: {
    marginBottom: 24,
  },
  picker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d8b4fe',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#faf5ff',
  },
  pickerEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  pickerText: {
    color: '#9333ea',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  pickerHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde047',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    color: '#92400e',
    fontSize: 14,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#9333ea',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  hintExample: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
    lineHeight: 16,
  },
});
