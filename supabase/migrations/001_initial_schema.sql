-- 助盲跑数据库 Schema
-- 运行方式：在 Supabase Dashboard -> SQL Editor -> 粘贴执行

-- ============ 用户相关 ============

-- 用户表（扩展 auth.users）
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  role text not null check (role in ('blind', 'volunteer', 'club_admin')),
  name text not null,
  gender text check (gender in ('male', 'female')),
  created_at timestamptz default now()
);

-- 盲人用户扩展信息
create table if not exists public.blind_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  has_disability_cert boolean default false,
  disability_level text,
  emergency_contact text,
  emergency_phone text
);

-- 志愿者扩展信息
create table if not exists public.volunteer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  running_experience text check (running_experience in ('none', 'beginner', 'intermediate', 'experienced')),
  bio text,
  joined_club_id uuid
);

-- ============ 跑团相关 ============

-- 跑团表
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  location text not null,
  description text,
  admin_user_id uuid references public.users(id),
  created_at timestamptz default now()
);

-- 志愿者加入跑团申请表
create table if not exists public.club_applications (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  experience text,
  applied_at timestamptz default now(),
  unique(club_id, user_id)
);

-- 跑团成员表
create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  activities_count int default 0,
  service_hours decimal default 0,
  unique(club_id, user_id)
);

-- ============ 活动相关 ============

-- 活动表
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text not null,
  duration_hours int not null,
  method text check (method in ('guide', 'walk', 'both')),
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_volunteers int default 2,
  current_volunteers int default 0,
  created_at timestamptz default now()
);

-- ============ 报名相关 ============

-- 报名表
create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  blind_user_id uuid not null references public.users(id) on delete cascade,
  volunteer_user_id uuid references public.users(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'ongoing', 'completed', 'absent')),
  status_text text default '待确认同行',
  volunteer_phone text,
  notes text,
  created_at timestamptz default now()
);

-- ============ 评价相关 ============

-- 评价表
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null references public.signups(id) on delete cascade,
  reviewer_id uuid not null references public.users(id) on delete cascade,
  reviewee_id uuid not null references public.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ============ Row Level Security ============

-- 启用 RLS
alter table public.users enable row level security;
alter table public.blind_profiles enable row level security;
alter table public.volunteer_profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_applications enable row level security;
alter table public.club_members enable row level security;
alter table public.activities enable row level security;
alter table public.signups enable row level security;
alter table public.reviews enable row level security;

-- 策略：用户只能查看自己的完整信息
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- 策略：盲人档案只能本人查看
create policy "Blind profiles are private" on public.blind_profiles
  for all using (auth.uid() = user_id);

-- 策略：志愿者档案只能本人查看
create policy "Volunteer profiles are private" on public.volunteer_profiles
  for all using (auth.uid() = user_id);

-- 策略：跑团公开可读
create policy "Clubs are public" on public.clubs
  for select using (true);

-- 策略：只有跑团管理员能创建/更新跑团
create policy "Only admin can manage clubs" on public.clubs
  for all using (
    auth.uid() = admin_user_id or
    exists (
      select 1 from public.club_members cm
      where cm.user_id = auth.uid() and cm.club_id = clubs.id
    )
  );

-- 策略：加入申请只有跑团管理员和申请人能看到
create policy "Applications visible to club admin and applicant" on public.club_applications
  for select using (
    auth.uid() = user_id or
    auth.uid() = (select admin_user_id from public.clubs where id = club_id)
  );

-- 策略：活动公开可读
create policy "Activities are public" on public.activities
  for select using (true);

-- 策略：活动只能由志愿者（已审核）或跑团管理员创建
create policy "Volunteers can create activities" on public.activities
  for insert with check (auth.uid() = author_id);

-- 策略：报名只能被相关方查看
create policy "Signups visible to participants" on public.signups
  for select using (
    auth.uid() = blind_user_id or
    auth.uid() = volunteer_user_id or
    auth.uid() in (select author_id from public.activities where id = activity_id)
  );

-- 策略：盲人只能给自己报名
create policy "Blind can create signup for self" on public.signups
  for insert with check (auth.uid() = blind_user_id);

-- 策略：评价只能评价参与过同一活动的用户
create policy "Reviews between participants" on public.reviews
  for insert with check (
    auth.uid() = reviewer_id and
    exists (
      select 1 from public.signups s
      where s.id = signup_id and (s.blind_user_id = auth.uid() or s.volunteer_user_id = auth.uid())
    )
  );

-- ============ 索引 ============

create index if not exists idx_activities_date on public.activities(date);
create index if not exists idx_activities_club_id on public.activities(club_id);
create index if not exists idx_signups_activity_id on public.signups(activity_id);
create index if not exists idx_signups_blind_user_id on public.signups(blind_user_id);
create index if not exists idx_club_applications_club_id on public.club_applications(club_id);
create index if not exists idx_club_members_club_id on public.club_members(club_id);

-- ============ 触发器：自动创建用户档案 ============

-- 创建用户时自动创建盲人档案
create or replace function public.handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'role' = 'blind' then
    insert into public.blind_profiles (user_id) values (new.id);
  elsif new.raw_user_meta_data->>'role' in ('volunteer', 'club_admin') then
    insert into public.volunteer_profiles (user_id) values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
