-- =====================================================
-- Dance Competition App - Supabase Database Setup
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- 1. Create Users Table (optional, for additional user data)
-- Note: Supabase Auth manages authentication separately
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Videos Table
-- Stores metadata for dance competition videos
-- IMPORTANT: Only stores URLs, not actual video files
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  user_id UUID REFERENCES public.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Leaderboard Table
-- Stores competition scores and rankings
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dancer_name TEXT NOT NULL,
  score INT NOT NULL,
  video_id UUID REFERENCES public.videos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_videos_is_public ON public.videos(is_public);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);

-- =====================================================
-- Insert Sample Data
-- =====================================================

-- Sample Videos (using free, public video URLs)
-- These are from Google's sample video repository
INSERT INTO public.videos (url, title, description, is_public, views, likes) VALUES
  (
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'Epic Dance Battle',
    'An incredible dance battle showcasing amazing choreography',
    TRUE,
    1250,
    342
  ),
  (
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'Street Dance Crew',
    'Street dancers showing off their best moves',
    TRUE,
    890,
    256
  ),
  (
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'Solo Performance',
    'A stunning solo contemporary dance performance',
    TRUE,
    1450,
    489
  ),
  (
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'Dance Competition Finals',
    'The grand finale of our monthly dance competition',
    TRUE,
    2100,
    678
  ),
  (
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'Contemporary Dance',
    'Beautiful contemporary dance with emotional storytelling',
    TRUE,
    1680,
    512
  ),
  (
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'Hip Hop Freestyle',
    'High-energy hip hop freestyle performance',
    TRUE,
    975,
    287
  ),
  (
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'Ballroom Excellence',
    'Elegant ballroom dancing at its finest',
    TRUE,
    1150,
    398
  );

-- Sample Leaderboard Entries
INSERT INTO public.leaderboard (dancer_name, score) VALUES
  ('Ava Martinez', 98),
  ('Liam Chen', 95),
  ('Mia Rodriguez', 92),
  ('Noah Williams', 88),
  ('Emma Johnson', 85),
  ('Oliver Davis', 82),
  ('Sophia Garcia', 79),
  ('James Brown', 76),
  ('Isabella Lopez', 74),
  ('Ethan Taylor', 71),
  ('Charlotte Anderson', 68),
  ('Mason Thomas', 65);

-- =====================================================
-- Set Up Row Level Security (RLS) - Optional
-- =====================================================
-- Uncomment these if you want to enable RLS for security

-- ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow public read access to videos
-- CREATE POLICY "Public videos are viewable by everyone"
--   ON public.videos FOR SELECT
--   USING (is_public = true);

-- Allow authenticated users to insert videos
-- CREATE POLICY "Users can insert their own videos"
--   ON public.videos FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Success! Your database is ready.
-- =====================================================
-- Next steps:
-- 1. Go to Settings > API to get your credentials
-- 2. Copy SUPABASE_URL and SUPABASE_ANON_KEY
-- 3. Paste them into your .env file
-- 4. Run your app: npm start
-- =====================================================
