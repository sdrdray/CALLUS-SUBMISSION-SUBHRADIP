import { useState } from 'react';
import { View, TextInput, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuthStore';

export default function AuthScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // For mobile apps, set a custom redirect that won't cause localhost issues
          // You can set this to your app's deep link or leave undefined for email-only verification
          emailRedirectTo: undefined,
          data: {
            email: email,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && !data.user.identities?.length) {
        // Email already registered
        setError('This email is already registered. Please sign in instead.');
      } else if (data.session) {
        // User is automatically signed in (email verification is disabled in Supabase)
        setSuccess('🎉 Account created! You are now signed in.');
        setEmail('');
        setPassword('');
        setTimeout(() => router.push('/'), 1500);
      } else if (data.user) {
        // Email verification is enabled - user needs to verify
        setSuccess('✉️ Check your email! Click the verification link to activate your account, then return here and sign in.');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in');
        } else {
          setError(signInError.message);
        }
      } else {
        setSuccess('✅ Signed in successfully!');
        setEmail('');
        setPassword('');
        setTimeout(() => router.push('/'), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSuccess('Signed out successfully!');
  };

  if (userId) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.signedInTitle}>You're Signed In!</Text>
          <Text style={styles.userId}>User ID: {userId.slice(0, 8)}...</Text>
          
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          )}
          
          <Pressable style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => router.push('/')}>
            <Text style={styles.outlineButtonText}>Back to Feed</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>💃</Text>
          <Text style={styles.title}>Dance App</Text>
          <Text style={styles.subtitle}>Join the global dance community</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                placeholderTextColor="#9ca3af"
                editable={true}
                returnKeyType="next"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                placeholderTextColor="#9ca3af"
                editable={true}
                returnKeyType="done"
                textContentType="password"
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            <Pressable 
              style={[styles.primaryButton, loading && styles.disabledButton]} 
              onPress={signIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>
            
            <Pressable 
              style={[styles.outlineButton, loading && styles.disabledButton]} 
              onPress={signUp}
              disabled={loading}
            >
              <Text style={styles.outlineButtonText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable onPress={() => router.push('/')} style={styles.guestButton}>
              <Text style={styles.guestText}>👻 Continue as Guest</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scroll: {
    backgroundColor: '#f3e8ff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3e8ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#581c87',
    marginBottom: 8,
  },
  signedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
  },
  userId: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    color: '#15803d',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#9333ea',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButtonText: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 12,
  },
  guestText: {
    color: '#9333ea',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    color: '#92400e',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
