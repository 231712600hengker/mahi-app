-- Run this in your Supabase SQL Editor

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  daily_calorie_goal integer not null default 2000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Food logs table
create table if not exists public.food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  food_name text not null,
  quantity text not null default '1 porsi',
  calories integer not null default 0,
  protein numeric(6,1) not null default 0,
  carbs numeric(6,1) not null default 0,
  fat numeric(6,1) not null default 0,
  fiber numeric(6,1) not null default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.food_logs enable row level security;

-- 4. RLS Policies: profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. RLS Policies: food_logs
create policy "Users can view own logs"
  on public.food_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.food_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.food_logs for delete
  using (auth.uid() = user_id);

-- 6. Storage bucket for food images
-- Run manually in Supabase Dashboard > Storage > New Bucket
-- Name: food-images, Public: true
