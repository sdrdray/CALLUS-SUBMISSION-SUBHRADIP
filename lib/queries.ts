import { supabase } from './supabase';

export type VideoMeta = { id: string; url: string; title?: string };
export type LeaderboardEntry = { dancer_name: string; score: number };

export async function getPublicVideos(): Promise<VideoMeta[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('id,url,title')
    .eq('is_public', true)
    .limit(10);

  if (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos from Supabase');
  }

  return (data || []) as VideoMeta[];
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('dancer_name,score')
    .order('score', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Failed to fetch leaderboard from Supabase');
  }

  return (data || []) as LeaderboardEntry[];
}
