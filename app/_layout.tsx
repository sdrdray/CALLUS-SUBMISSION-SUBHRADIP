import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../hooks/useAuthStore';
import SplashScreen from '../components/SplashScreen';

const queryClient = new QueryClient();

export default function RootLayout() {
  const setUserId = useAuthStore((s) => s.setUserId);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simulate minimum splash screen time for better UX
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500); // Show splash for 2.5 seconds minimum

    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    
    return () => {
      clearTimeout(timer);
      sub.subscription?.unsubscribe();
    };
  }, [setUserId]);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="light" />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
