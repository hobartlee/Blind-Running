---
title: "助盲跑后端技术方案"
date: 2026-04-02
status: draft
audience: both
---

# 助盲跑后端技术方案

## 技术选型

| 组件 | 选择 | 理由 |
|------|------|------|
| **BaaS 平台** | Supabase | 开源、PostgreSQL、免费额度够用 |
| **数据库** | PostgreSQL | Supabase 内置 |
| **认证** | Supabase Auth | 支持手机号登录 |
| **实时订阅** | Supabase Realtime | 活动列表自动更新 |
| **边缘函数** | Supabase Edge Functions | 无服务器 API 逻辑 |

---

## 数据库 Schema

### 1. users（用户表）

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  role text not null check (role in ('blind', 'volunteer', 'club_admin')),
  name text not null,
  gender text check (gender in ('male', 'female')),
  created_at timestamptz default now()
);

-- 盲人用户扩展信息
create table blind_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  has_disability_cert boolean default false,
  disability_level text,
  emergency_contact text,
  emergency_phone text
);

-- 志愿者扩展信息
create table volunteer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  running_experience text check (running_experience in ('none', 'beginner', 'intermediate', 'experienced')),
  bio text,
  joined_club_id uuid
);
```

### 2. clubs（跑团表）

```sql
create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  location text not null,
  admin_user_id uuid references users(id),
  created_at timestamptz default now()
);

-- 志愿者加入跑团申请表
create table club_applications (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  experience text,
  applied_at timestamptz default now(),
  unique(club_id, user_id)
);

-- 跑团成员表
create table club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz default now(),
  activities_count int default 0,
  service_hours decimal default 0,
  unique(club_id, user_id)
);
```

### 3. activities（活动表）

```sql
create table activities (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete set null,
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location text not null,
  duration_hours int not null,
  method text check (method in ('guide', 'walk', 'both')),
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_volunteers int default 2,
  created_at timestamptz default now()
);
```

### 4. signups（报名表）

```sql
create table signups (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  blind_user_id uuid not null references users(id) on delete cascade,
  volunteer_user_id uuid references users(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'ongoing', 'completed', 'absent')),
  status_text text default '待确认同行',
  volunteer_phone text,
  notes text,
  created_at timestamptz default now()
);
```

### 5. reviews（评价表）

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null references signups(id) on delete cascade,
  reviewer_id uuid not null references users(id) on delete cascade,
  reviewee_id uuid not null references users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);
```

---

## Row Level Security (RLS)

```sql
-- 开启 RLS
alter table users enable row level security;
alter table clubs enable row level security;
alter table activities enable row level security;
alter table signups enable row level security;
alter table club_applications enable row level security;

-- 用户只能查看自己的数据
create policy "Users can view own data" on users
  for select using (auth.uid() = id);

-- 活动公开可读
create policy "Activities are public" on activities
  for select using (true);

-- 报名只能被报名者和活动作者查看
create policy "Signups visible to participants" on signups
  for select using (
    auth.uid() = blind_user_id or
    auth.uid() = volunteer_user_id or
    auth.uid() in (select author_id from activities where id = activity_id)
  );
```

---

## API 设计（Supabase Edge Functions）

### 认证

```
POST /functions/v1/send-sms-code
  Body: { phone: "13800138000" }
  Response: { success: true, message: "验证码已发送" }

POST /functions/v1/verify-sms-code
  Body: { phone: "13800138000", code: "123456" }
  Response: { token: "jwt_token", user: {...} }
```

### 用户

```
GET /functions/v1/users/me
  Headers: Authorization: Bearer <token>
  Response: { id, phone, role, name, ... }

PATCH /functions/v1/users/me
  Body: { name, gender, ... }
  Response: { ...updated_user }
```

### 跑团

```
GET /functions/v1/clubs
  Response: [{ id, name, location, member_count }, ...]

GET /functions/v1/clubs/:id/volunteers
  Response: [{ user_id, name, experience, status }, ...]

POST /functions/v1/clubs
  Body: { name, contact, location }
  Auth: club_admin
  Response: { club }

PATCH /functions/v1/applications/:id
  Body: { status: "approved" | "rejected" }
  Auth: club_admin
  Response: { success }
```

### 活动

```
GET /functions/v1/activities
  Query: ?date=2026-04-05&location=朝阳
  Response: [{ id, title, date, time, location, club_name, author_name }, ...]

POST /functions/v1/activities
  Body: { title, date, time, location, duration, method }
  Auth: volunteer (approved) or club_admin
  Response: { activity }

GET /functions/v1/activities/:id/signups
  Auth: activity author
  Response: [{ blind_user, status, applied_at }, ...]
```

### 报名

```
POST /functions/v1/signups
  Body: { activity_id }
  Auth: blind
  Response: { signup }

PATCH /functions/v1/signups/:id
  Body: { status, volunteer_phone? }
  Auth: volunteer or club_admin
  Response: { updated_signup }
```

---

## 环境变量

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 一期免费额度

| 资源 | 额度 |
|------|------|
| 用户数 | 50,000 |
| 数据库 | 500MB |
| 月传输 | 2GB |
| Edge Functions | 50,000 次/秒 |

足够一期小规模运营。

---

## 后续扩展

- **即时通讯**：集成 Supabase Realtime 或 飞书/钉钉机器人
- **推送通知**：集成 OneSignal 或 极光推送
- **支付**：集成微信支付/支付宝（需企业资质）
- **地图**：集成高德/百度地图（陪跑路线规划）
