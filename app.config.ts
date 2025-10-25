import type { ExpoConfig } from '@expo/config-types';

const defineConfig = (): ExpoConfig => ({
  name: 'dance-competition-app',
  slug: 'dance-competition-app',
  plugins: ['expo-router'],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});

export default defineConfig;