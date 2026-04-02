---
title: "Supabase 后端接入指南"
date: 2026-04-02
status: draft
audience: human
---

# Supabase 后端接入指南

## 第一步：创建 Supabase 项目

1. 访问 [supabase.com/dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息（选择离中国近的区域：Singapore 或 Tokyo）
4. 设置数据库密码（记住它）
5. 等待项目创建完成（约 2 分钟）

## 第二步：获取 API 密钥

1. 进入项目 -> **Settings** -> **API**
2. 找到以下信息：
   - `Project URL`: `https://xxxx.supabase.co`
   - `anon public` key: `eyJhbG...`
   - `service_role` key: `eyJhbG...`（仅后端使用）

3. 在前端项目根目录创建 `.env.local` 文件：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...
   ```

## 第三步：创建数据库表

### 方式一：SQL Editor（推荐）

1. 进入 Supabase Dashboard -> **SQL Editor**
2. 新建查询，粘贴 `supabase/migrations/001_initial_schema.sql` 的内容
3. 点击 **Run** 执行

### 方式二：Table Editor

在 Supabase Dashboard -> **Table Editor** 中手动创建表（不推荐，RLS 策略容易遗漏）

## 第四步：配置手机登录

Supabase 默认使用邮箱登录。要启用手机号登录：

1. 进入项目 -> **Authentication** -> **Providers** -> **Phone**
2. 启用 SMS
3. 需要配置 SMS Provider（可选，但验证码需要）：
   - Twilio
   - Vonage
   - 或使用 Supabase 内置的测试模式

### 测试模式（开发用）

开发阶段可以使用内置测试验证码，固定为 `123456`。

生产环境请配置真实的 SMS Provider。

## 第五步：验证接入

在浏览器控制台测试：

```javascript
import { supabase } from './lib/supabase'

// 测试连接
const { data, error } = await supabase.from('clubs').select('*')
console.log(data, error)
```

## 第六步：部署 Edge Functions（可选）

如果需要自定义 API 逻辑（如发送短信），使用 Edge Functions：

1. 安装 Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. 初始化：
   ```bash
   supabase init
   ```

3. 开发部署：
   ```bash
   supabase functions serve
   ```

## 常见问题

### Q: 验证码发不出去？
A: 检查 SMS Provider 配置。开发阶段使用测试码 `123456`。

### Q: RLS 导致数据读不到？
A: 在 Table Editor 中检查对应表的 **Policies** 是否有允许的规则。

### Q: 如何重置数据库？
A: 在 Supabase Dashboard -> **SQL Editor** 执行 `drop schema public cascade && create schema public`，然后重新运行 migration。

## 后续步骤

1. 配置生产环境的 SMS Provider
2. 部署 Edge Functions 处理复杂业务逻辑
3. 接入地图/位置服务
4. 配置数据备份策略
