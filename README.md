# Dance Competition App 

Hey there! I'm Subhradip from Amity University, and this is my slight desc. on building a short-form dance competition app. 

## What I Built

I created a mobile app where dancers can:
- Share their videos through video uploads
- Compete on a real-time leaderboard (mock currently , can be converted to production ready if needed , for now i am doing as instructed) 
- Discover amazing dance content in a vertical feed
- Join the community through simple authentication

The challenge was to build this using **React Native, Expo, TypeScript, Supabase, and React Query** while ensuring all videos come from external URLs (no local files allowed!).

## 🛠️ Technologies I Used

**Frontend Stack:**
- React Native + Expo 
- TypeScript 
- NativeWind (Tailwind CSS for React Native)
- Expo Router (file-based routing )

**State Management:**
- React Query for server state 
- Zustand for client state 

**Backend:**
- Supabase (Auth + Database + Storage)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your phone
- A Supabase account (free tier)

### Step 1: Clone My Repo
```bash
git clone https://github.com/sdrdray/CALLUS-SUBMISSION-SUBHRADIP.git
cd CALLUS-SUBMISSION-SUBHRADIP
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment
Create a `.env` file in the root:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```
Get these from your Supabase dashboard (Settings > API).

### Step 4: Set Up Database
1. Open Supabase SQL Editor
2. Copy-paste everything from `supabase-setup.sql`
3. Hit Run!

This creates the tables and adds some sample dance videos (all external URLs, of course).

### Step 5: Launch the App
```bash
npx expo start
```

Scan the QR code with Expo Go and you're ready! 

## 📂 How I Organized Everything

```
📁 app/           → All my screens 
📁 components/    → Reusable UI pieces  
📁 lib/          → Core logic and API calls
📁 hooks/        → Custom React hooks
📁 assets/       → Images and icons
```


## 🎯 Key Features 

### 1. Smart Video Feed (`app/index.tsx`)
- Vertical scrolling like youtube
- Only the visible video plays 
- Smooth performance with React Query caching
- **All videos are external URLs** - fetched from Supabase database

### 2. Flexible Video Player (`components/VideoPlayer.tsx`)
This was built so that it can do these also :
- YouTube links (embedded player)
- Google Drive videos (auto-converts share links)
- Direct MP4 URLs (native Expo video player)
- Smart play/pause based on visibility

### 3. Dual Upload System (`app/upload.tsx`)
Users can upload videos in two ways:
- **URL Mode**: Paste any external video link
- **File Mode**: Upload to Supabase Storage, get back a public URL

Both methods ensure we only store external URLs in the database.

### 4. Real-time Leaderboard (`app/leaderboard.tsx`)
- Live data from Supabase
- Special styling for top 3 dancers
- Smooth responsive design

## 🗄️ Database Design

**Videos Table:**
```sql
- id (UUID)
- url (TEXT) 
- title, description
- user_id, is_public
- views, likes, created_at
```

**Leaderboard Table:**
```sql
- id, dancer_name, score
- video_id (references videos)
- created_at
```

## 🚧 Challenges I Faced

1. **External URLs Only**: Had to ensure no local video files 
2. **Multiple Video Types**: YouTube, Drive, and direct URLs all behave differently  
3. **Performance**: Making sure only active videos play to save battery
4. **State Management**: Keeping server and client state cleanly separated

## 🚀 What's Next?

If I had more time, I'd add:
- Real-time comments and reactions
- User profiles with avatars
- In-app video recording
- Push notifications
- Social sharing features

## 📱 Test It Out

The app is at: https://github.com/sdrdray/CALLUS-SUBMISSION-SUBHRADIP

Clone it and run it

---


