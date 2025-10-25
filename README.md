# Dance Competition App 🎬

A short-form dance competition mobile app built with React Native, Expo, TypeScript, Supabase, and React Query.

## 📱 Features

### Core Functionality
- **Authentication** - Sign up, sign in, and guest mode
- **Video Feed** - Vertical scrolling feed with external video URLs
- **Leaderboard** - Competition rankings with scores
- **Video Upload** - Upload videos via URL or file upload to Supabase Storage

### Technical Highlights
- ✅ **React Native + Expo** - Cross-platform mobile development
- ✅ **TypeScript** - Type-safe code throughout
- ✅ **Tailwind CSS (NativeWind)** - Utility-first styling
- ✅ **React Query (TanStack Query)** - Server state management
- ✅ **Zustand** - Client state management
- ✅ **Supabase** - Backend (Auth, Database, Storage)
- ✅ **Expo Router** - File-based navigation
- ✅ **Expo Video** - Optimized video playback

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo Go app (for testing on mobile)
- Supabase account

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd dance-competition-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy "Project URL" and "anon public" key

### 4. Database Setup
Run the SQL in `supabase-setup.sql` in your Supabase SQL Editor:
1. Go to Supabase Dashboard > SQL Editor
2. Click "New query"
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "Run"

This creates:
- `videos` table - Stores video metadata
- `leaderboard` table - Stores competition scores
- Sample data for testing

### 5. Start Development Server
```bash
npx expo start
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

---

## 📁 Project Structure

```
dance-competition-app/
├── app/                          # Screens (Expo Router)
│   ├── _layout.tsx              # Root navigation layout
│   ├── index.tsx                # Video feed (home screen)
│   ├── auth.tsx                 # Login/register screen
│   ├── leaderboard.tsx          # Competition leaderboard
│   └── upload.tsx               # Video upload screen
│
├── components/                   # Reusable components
│   ├── VideoPlayer.tsx          # Video playback component
│   ├── LeaderboardItem.tsx      # Leaderboard entry component
│   └── Button.tsx               # Custom button component
│
├── lib/                         # Core utilities
│   ├── supabase.ts             # Supabase client setup
│   └── queries.ts              # React Query hooks
│
├── hooks/                       # Custom hooks
│   └── useAuthStore.ts         # Zustand auth state
│
├── assets/                      # Static assets
│
├── .env                        # Environment variables (not in git)
├── app.json                    # Expo configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

### Architecture Principles

**1. Separation of Concerns**
- `app/` - UI screens and routing
- `components/` - Reusable UI components
- `lib/` - Business logic and API calls
- `hooks/` - Custom React hooks for state

**2. State Management**
- **Server State** - React Query (`lib/queries.ts`)
- **Client State** - Zustand (`hooks/useAuthStore.ts`)
- Clear separation between server and UI state

**3. Type Safety**
- TypeScript throughout the codebase
- Type definitions for Supabase tables
- Strict type checking enabled

**4. Maintainability**
- Small, focused files (single responsibility)
- Consistent naming conventions
- Clear folder structure
- Reusable components

---

## 🛠 Tech Stack

### Frontend
- **React Native 0.81** - Mobile framework
- **Expo 54** - Development platform
- **TypeScript 5.9** - Type safety
- **NativeWind 4.2** - Tailwind CSS for React Native
- **Expo Router 6.0** - File-based navigation
- **Expo Video 3.0** - Video playback

### State Management
- **React Query 5.90** - Server state (data fetching, caching)
- **Zustand 5.0** - Client state (auth, UI state)

### Backend
- **Supabase 2.75** - BaaS platform
  - Authentication (email/password)
  - PostgreSQL database
  - Storage (video files)
  - Real-time subscriptions (optional)

### Additional Libraries
- **Expo Image Picker** - Media selection
- **Expo File System** - File handling
- **React Native WebView** - Web content display

---

## 📱 App Screens

### 1. Authentication (`app/auth.tsx`)
- Sign up with email/password
- Sign in for existing users
- Guest mode (browse without account)
- Form validation and error handling

### 2. Video Feed (`app/index.tsx`)
- Vertical scrolling feed (TikTok-style)
- Videos play when active in viewport
- Like, comment, share interactions
- Pull to refresh
- External video URLs only (no local files)

### 3. Leaderboard (`app/leaderboard.tsx`)
- Top dancers ranked by score
- Real-time data from Supabase
- Special styling for top 3 positions
- Score and dancer name display

### 4. Upload (`app/upload.tsx`)
- Two upload modes:
  - URL mode: Paste video URL
  - File mode: Upload to Supabase Storage
- Support for YouTube, Google Drive, direct URLs
- Auto-converts share links to playable URLs

---

## 🎯 Key Features Implementation

### Video Feed with External URLs
```typescript
// lib/queries.ts
export const getVideos = async (): Promise<VideoMeta[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
```

Videos are fetched from Supabase and use external URLs stored in the database - no local video files.

### React Query Integration
```typescript
// app/index.tsx
const { data: videos, isLoading, refetch } = useQuery({
  queryKey: ['videos'],
  queryFn: getVideos,
  refetchOnMount: true,
});
```

Automatic caching, background refetching, and optimistic updates.

### State Management with Zustand
```typescript
// hooks/useAuthStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
  clearAuth: () => set({ userId: null }),
}));
```

Minimal boilerplate, TypeScript support, and easy to test.

### Tailwind CSS Styling
```typescript
<View className="flex-1 bg-purple-50">
  <Text className="text-2xl font-bold text-purple-900">
    Leaderboard
  </Text>
</View>
```

NativeWind provides Tailwind CSS utility classes for React Native.

---

## 🗄 Database Schema

### Videos Table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,              -- External video URL
  title TEXT,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Leaderboard Table
```sql
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dancer_name TEXT NOT NULL,
  score INT NOT NULL,
  video_id UUID REFERENCES videos(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing the App

### 1. Test Authentication
- Create a new account
- Sign in with the account
- Try guest mode

### 2. Test Video Feed
- Videos should autoplay when in view
- Swipe up/down to navigate
- Like/comment counters update
- Pull down to refresh

### 3. Test Leaderboard
- See top dancers
- Check score ordering
- View special styling for top 3

### 4. Test Upload
- Try URL mode with sample URLs
- Try file mode (if Supabase Storage configured)

---

## 🚧 Known Limitations

- YouTube embeds may have playback restrictions in WebView
- Google Drive videos must be set to "Anyone with the link"
- File uploads require Supabase Storage bucket setup
- No offline support (requires internet connection)

---

## 🔮 Future Enhancements

- [ ] Real-time likes/comments with Supabase subscriptions
- [ ] User profiles with avatars
- [ ] Video recording in-app
- [ ] Advanced video filters
- [ ] Push notifications for new uploads
- [ ] Social sharing integration

---

## 📄 License

MIT License - feel free to use this project for learning purposes.

---

## 👨‍💻 Development Notes

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ ESLint configuration
- ✅ Consistent code formatting
- ✅ Clear component hierarchy
- ✅ Separation of concerns

### Performance
- ✅ React Query caching reduces API calls
- ✅ Video player optimized for mobile
- ✅ Lazy loading of components
- ✅ Memoization for expensive computations

### Maintainability
- ✅ Small, focused files (under 500 lines)
- ✅ Clear naming conventions
- ✅ Reusable components
- ✅ Centralized configuration
- ✅ Type-safe API calls

---

## 📞 Support

For issues or questions:
1. Check the code comments
2. Review Supabase setup in `supabase-setup.sql`
3. Check Expo documentation for platform-specific issues

---

**Built with ❤️ using React Native, Expo, TypeScript, and Supabase**
