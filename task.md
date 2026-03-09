# Makan Apa Hari Ini — Build Checklist

Mobile-first AI food logging app with camera scanning, AI food recognition, nutrition lookup, and daily calorie tracking.

---

## 1. Project Setup & Configuration
- [x] Scaffold Next.js 14 (App Router, TypeScript, Tailwind CSS)
- [ ] Configure environment variables (`.env.local`)
  - [ ] Supabase URL & anon key
  - [ ] Edamam API ID & key
  - [ ] AI model API key (e.g. Google Gemini Vision / OpenAI Vision)
- [ ] Set up absolute import aliases (`@/`)
- [ ] Install core dependencies
  - [ ] `@supabase/supabase-js`
  - [ ] `@supabase/auth-helpers-nextjs`
  - [ ] Edamam API client / fetch utility
  - [ ] AI SDK (e.g. `@google/generative-ai` or `openai`)

---

## 2. Supabase Backend
- [ ] Create Supabase project
- [ ] Design database schema
  - [ ] `profiles` — user metadata (id, name, daily_calorie_goal)
  - [ ] `food_logs` — (id, user_id, date, food_name, calories, nutrients, image_url, created_at)
- [ ] Enable Row Level Security (RLS) policies
- [ ] Set up Supabase Auth (email/password + Google OAuth)
- [ ] Create Supabase client utility (`lib/supabase.ts`)
- [ ] Set up Supabase Storage bucket for food images

---

## 3. Authentication
- [ ] Auth layout and pages (`/login`, `/signup`)
- [ ] Session handling via middleware (`middleware.ts`)
- [ ] Redirect unauthenticated users to `/login`
- [ ] User profile setup on first sign-in

---

## 4. Camera & Image Capture
- [ ] Camera capture component (`components/CameraCapture.tsx`)
  - [ ] Access device camera via `getUserMedia` API
  - [ ] Live camera preview (mobile-friendly, full-width)
  - [ ] Capture photo (canvas snapshot)
  - [ ] Gallery/file picker fallback
- [ ] Image preview & retake UI
- [ ] Upload captured image to Supabase Storage

---

## 5. AI Food Recognition
- [ ] Server Action / API route for AI recognition (`app/api/recognize/route.ts`)
- [ ] Send image (base64 / URL) to AI Vision model
- [ ] Parse AI response → extract food name, estimated portion
- [ ] Display recognition result to user for confirmation/edit

---

## 6. Edamam Nutrition API Integration
- [ ] Edamam API utility (`lib/edamam.ts`)
- [ ] Query nutrition data by food name + quantity
- [ ] Parse response → calories, macros (protein, carbs, fat, fiber)
- [ ] Map Edamam response to `food_logs` schema

---

## 7. Food Logging Flow
- [ ] Log Food page/modal (`app/log/page.tsx`)
  - [ ] Trigger camera or gallery pick
  - [ ] Show AI recognition result
  - [ ] Show fetched nutrition data
  - [ ] Allow user to edit food name / quantity
  - [ ] Confirm & save log to Supabase
- [ ] Success/error feedback (toast notifications)

---

## 8. Daily Calorie Tracking Dashboard
- [ ] Home / Dashboard page (`app/(dashboard)/page.tsx`)
  - [ ] Daily calorie summary ring/progress bar
  - [ ] Macro breakdown (protein, carbs, fat)
  - [ ] Chronological food log list for today
  - [ ] Date navigation (previous days)
- [ ] Food log item card (`components/FoodLogItem.tsx`)
  - [ ] Food name, calories, macros, thumbnail
  - [ ] Delete log entry
- [ ] Calorie goal setting (in profile/settings)

---

## 9. Mobile-First UI & Navigation
- [ ] Bottom navigation bar (`components/BottomNav.tsx`)
  - [ ] Home (dashboard), Log Food (camera CTA), History, Profile
- [ ] Floating action button for quick food log
- [ ] Responsive layout (max-width container, safe-area insets)
- [ ] Loading skeletons for async data
- [ ] Empty state illustrations

---

## 10. History & Analytics
- [ ] History page (`app/history/page.tsx`)
  - [ ] Weekly calorie chart (bar/line)
  - [ ] Past food logs grouped by date
- [ ] Weekly average calories & macros

---

## 11. Profile & Settings
- [ ] Profile page (`app/profile/page.tsx`)
  - [ ] Display name, email
  - [ ] Set daily calorie goal
  - [ ] Sign out
- [ ] Update profile in Supabase

---

## 12. PWA & Mobile Enhancements
- [ ] `manifest.json` for PWA (app name, icons, theme color)
- [ ] Add `viewport` meta tag for mobile
- [ ] iOS splash screen & icon assets
- [ ] Offline-friendly feedback (loading/error states)

---

## 13. Testing & Quality
- [ ] TypeScript strict mode — no `any` types
- [ ] ESLint — no errors
- [ ] Test auth flow (sign up → login → logout)
- [ ] Test camera capture on mobile device
- [ ] Test AI recognition with various food photos
- [ ] Test Edamam nutrition fetch
- [ ] Test daily log CRUD operations
- [ ] Test RLS — users cannot access other users' data

---

## 14. Deployment
- [ ] Deploy to Vercel
- [ ] Set production environment variables in Vercel dashboard
- [ ] Verify Supabase RLS in production
- [ ] Test on real mobile device (iOS + Android)
