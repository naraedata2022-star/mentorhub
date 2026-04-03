-- MentorHub 초기 스키마
-- 10개 테이블 + RLS 정책

-- 1. users (auth.users 확장)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  bio text,
  region text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. categories
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  icon text,
  sort_order integer default 0
);

-- 3. user_skills (가르칠 수 있는 것)
create table public.user_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null
);

-- 4. user_interests (배우고 싶은 것)
create table public.user_interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null
);

-- 5. mentoring_sessions
create table public.mentoring_sessions (
  id uuid default gen_random_uuid() primary key,
  mentor_id uuid references public.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  schedule text,
  status text default 'active' check (status in ('active', 'closed', 'completed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 6. session_applications
create table public.session_applications (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.mentoring_sessions(id) on delete cascade not null,
  applicant_id uuid references public.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now() not null
);

-- 7. matches
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user_a_id uuid references public.users(id) on delete cascade not null,
  user_b_id uuid references public.users(id) on delete cascade not null,
  score double precision not null default 0,
  status text default 'pending' check (status in ('pending', 'accepted', 'dismissed')),
  created_at timestamptz default now() not null
);

-- 8. chat_rooms
create table public.chat_rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null
);

-- 9. chat_participants
create table public.chat_participants (
  id uuid default gen_random_uuid() primary key,
  chat_room_id uuid references public.chat_rooms(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  joined_at timestamptz default now() not null,
  unique(chat_room_id, user_id)
);

-- 10. messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_room_id uuid references public.chat_rooms(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

-- 인덱스
create index idx_user_skills_user on public.user_skills(user_id);
create index idx_user_interests_user on public.user_interests(user_id);
create index idx_mentoring_sessions_mentor on public.mentoring_sessions(mentor_id);
create index idx_mentoring_sessions_category on public.mentoring_sessions(category_id);
create index idx_mentoring_sessions_status on public.mentoring_sessions(status);
create index idx_session_applications_session on public.session_applications(session_id);
create index idx_matches_user_a on public.matches(user_a_id);
create index idx_matches_user_b on public.matches(user_b_id);
create index idx_chat_participants_room on public.chat_participants(chat_room_id);
create index idx_chat_participants_user on public.chat_participants(user_id);
create index idx_messages_room on public.messages(chat_room_id);
create index idx_messages_sender on public.messages(sender_id);
create index idx_messages_created on public.messages(created_at);

-- RLS 활성화
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.user_skills enable row level security;
alter table public.user_interests enable row level security;
alter table public.mentoring_sessions enable row level security;
alter table public.session_applications enable row level security;
alter table public.matches enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;

-- RLS 정책: users
create policy "Users are viewable by everyone" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

-- RLS 정책: categories (공개 읽기)
create policy "Categories are viewable by everyone" on public.categories for select using (true);

-- RLS 정책: user_skills
create policy "Skills are viewable by everyone" on public.user_skills for select using (true);
create policy "Users can manage own skills" on public.user_skills for insert with check (auth.uid() = user_id);
create policy "Users can update own skills" on public.user_skills for update using (auth.uid() = user_id);
create policy "Users can delete own skills" on public.user_skills for delete using (auth.uid() = user_id);

-- RLS 정책: user_interests
create policy "Interests are viewable by everyone" on public.user_interests for select using (true);
create policy "Users can manage own interests" on public.user_interests for insert with check (auth.uid() = user_id);
create policy "Users can update own interests" on public.user_interests for update using (auth.uid() = user_id);
create policy "Users can delete own interests" on public.user_interests for delete using (auth.uid() = user_id);

-- RLS 정책: mentoring_sessions
create policy "Sessions are viewable by everyone" on public.mentoring_sessions for select using (true);
create policy "Mentors can create sessions" on public.mentoring_sessions for insert with check (auth.uid() = mentor_id);
create policy "Mentors can update own sessions" on public.mentoring_sessions for update using (auth.uid() = mentor_id);
create policy "Mentors can delete own sessions" on public.mentoring_sessions for delete using (auth.uid() = mentor_id);

-- RLS 정책: session_applications
create policy "Applicants can view own applications" on public.session_applications for select using (auth.uid() = applicant_id);
create policy "Session mentors can view applications" on public.session_applications for select using (
  exists (select 1 from public.mentoring_sessions where id = session_id and mentor_id = auth.uid())
);
create policy "Users can apply to sessions" on public.session_applications for insert with check (auth.uid() = applicant_id);
create policy "Session mentors can update applications" on public.session_applications for update using (
  exists (select 1 from public.mentoring_sessions where id = session_id and mentor_id = auth.uid())
);

-- RLS 정책: matches
create policy "Users can view own matches" on public.matches for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);
create policy "Users can update own matches" on public.matches for update using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- RLS 정책: chat_rooms
create policy "Participants can view chat rooms" on public.chat_rooms for select using (
  exists (select 1 from public.chat_participants where chat_room_id = id and user_id = auth.uid())
);
create policy "Authenticated users can create chat rooms" on public.chat_rooms for insert with check (auth.uid() is not null);

-- RLS 정책: chat_participants
create policy "Participants can view room members" on public.chat_participants for select using (
  exists (select 1 from public.chat_participants cp where cp.chat_room_id = chat_room_id and cp.user_id = auth.uid())
);
create policy "Authenticated users can join rooms" on public.chat_participants for insert with check (auth.uid() = user_id);

-- RLS 정책: messages
create policy "Participants can view messages" on public.messages for select using (
  exists (select 1 from public.chat_participants where chat_room_id = messages.chat_room_id and user_id = auth.uid())
);
create policy "Participants can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from public.chat_participants where chat_room_id = messages.chat_room_id and user_id = auth.uid())
);
create policy "Participants can mark messages as read" on public.messages for update using (
  exists (select 1 from public.chat_participants where chat_room_id = messages.chat_room_id and user_id = auth.uid())
);

-- Realtime 활성화 (채팅)
alter publication supabase_realtime add table public.messages;
