import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ 认证相关 ============

/**
 * 发送手机验证码
 */
export async function sendSmsCode(phone) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms'
    }
  })
  return { data, error }
}

/**
 * 验证验证码
 */
export async function verifySmsCode(phone, code) {
  const { data, error } = await supabase.auth.verifyOTP(phone, { token: code, type: 'sms' })
  return { data, error }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * 登出
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ============ 用户相关 ============

/**
 * 获取当前用户完整信息
 */
export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('*, blind_profiles(*), volunteer_profiles(*)')
    .eq('id', user.id)
    .single()

  return { profile, error }
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}

// ============ 跑团相关 ============

/**
 * 获取跑团列表
 */
export async function getClubs() {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      club_members(count)
    `)
    .order('created_at', { ascending: false })

  return { clubs: data, error }
}

/**
 * 获取跑团详情
 */
export async function getClub(clubId) {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      club_members(*),
      club_applications(*)
    `)
    .eq('id', clubId)
    .single()

  return { club: data, error }
}

/**
 * 创建跑团
 */
export async function createClub(clubData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('clubs')
    .insert({ ...clubData, admin_user_id: user.id })
    .select()
    .single()

  return { club: data, error }
}

/**
 * 申请加入跑团
 */
export async function applyToJoinClub(clubId, experience) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('club_applications')
    .insert({ club_id: clubId, user_id: user.id, experience })
    .select()
    .single()

  return { application: data, error }
}

/**
 * 审核志愿者申请
 */
export async function reviewApplication(applicationId, status) {
  const { data, error } = await supabase
    .from('club_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()

  // 如果批准，同时添加到跑团成员
  if (status === 'approved' && !error) {
    const app = data
    await supabase.from('club_members').insert({
      club_id: app.club_id,
      user_id: app.user_id
    })
  }

  return { data, error }
}

// ============ 活动相关 ============

/**
 * 获取活动列表
 */
export async function getActivities({ date, location } = {}) {
  let query = supabase
    .from('activities')
    .select(`
      *,
      clubs(name),
      users(name)
    `)
    .eq('status', 'upcoming')
    .order('date', { ascending: true })

  if (date) {
    query = query.eq('date', date)
  }
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  const { data, error } = await query
  return { activities: data, error }
}

/**
 * 获取活动详情
 */
export async function getActivity(activityId) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      clubs(name, location),
      users(name)
    `)
    .eq('id', activityId)
    .single()

  return { activity: data, error }
}

/**
 * 创建活动
 */
export async function createActivity(activityData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('activities')
    .insert({ ...activityData, author_id: user.id })
    .select()
    .single()

  return { activity: data, error }
}

/**
 * 获取活动的报名列表
 */
export async function getActivitySignups(activityId) {
  const { data, error } = await supabase
    .from('signups')
    .select(`
      *,
      users(name, phone)
    `)
    .eq('activity_id', activityId)
    .order('created_at', { ascending: false })

  return { signups: data, error }
}

// ============ 报名相关 ============

/**
 * 报名参加活动
 */
export async function createSignup(activityId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('signups')
    .insert({
      activity_id: activityId,
      blind_user_id: user.id
    })
    .select()
    .single()

  return { signup: data, error }
}

/**
 * 获取我的报名列表
 */
export async function getMySignups() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('signups')
    .select(`
      *,
      activities(*),
      users!signups_volunteer_user_id_fkey(name)
    `)
    .eq('blind_user_id', user.id)
    .order('created_at', { ascending: false })

  return { signups: data, error }
}

/**
 * 更新报名状态
 */
export async function updateSignupStatus(signupId, updates) {
  const { data, error } = await supabase
    .from('signups')
    .update(updates)
    .eq('id', signupId)
    .select()
    .single()

  return { signup: data, error }
}

// ============ 评价相关 ============

/**
 * 提交评价
 */
export async function createReview(signupId, revieweeId, rating, comment) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      signup_id: signupId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment
    })
    .select()
    .single()

  return { review: data, error }
}

// ============ 实时订阅 ============

/**
 * 订阅活动列表变化
 */
export function subscribeToActivities(callback) {
  return supabase
    .channel('activities')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'activities'
    }, callback)
    .subscribe()
}

/**
 * 订阅报名变化
 */
export function subscribeToSignups(callback) {
  return supabase
    .channel('signups')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'signups'
    }, callback)
    .subscribe()
}
