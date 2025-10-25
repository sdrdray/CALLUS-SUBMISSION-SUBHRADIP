import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;

export const supabase = createClient(
  extra?.SUPABASE_URL || 'https://example.supabase.co',
  extra?.SUPABASE_ANON_KEY || 'public-anon-key'
);