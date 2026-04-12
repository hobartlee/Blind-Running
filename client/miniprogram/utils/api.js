// 微信云开发 API 配置
const CLOUD_ENV = 'cloud1-6geqajt41adff602' // 微信云开发环境ID

// 管理员手机号
const ADMIN_PHONE = '17610275009'

// 调用云函数
function callCloud(name, data = {}) {
  return wx.cloud.callFunction({
    name,
    data,
    config: { env: CLOUD_ENV }
  })
}

// 云函数方法

// 用户登录
async function login(phone, userType, openid) {
  const res = await callCloud('login', { phone, userType, openid })
  if (res.errMsg && !res.result) {
    throw new Error(res.errMsg)
  }
  return res.result
}

// 更新用户信息
async function updateUser(phone, userType, userData) {
  const res = await callCloud('updateUser', { phone, userType, ...userData })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result
}

// 获取用户列表
async function getUsers(type) {
  const res = await callCloud('getUsers', { type })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 创建/更新跑团
async function saveClub(phone, name, location, description) {
  const res = await callCloud('saveClub', { phone, name, location, description })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 获取跑团列表
async function getClubs() {
  const res = await callCloud('getClubs', {})
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 获取跑团详情
async function getClub(phone) {
  const res = await callCloud('getClub', { phone })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 按ID获取跑团详情
async function getClubById(id) {
  const res = await callCloud('getClub', { id })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 志愿者申请加入跑团
async function applyClub(userId, clubId, userName, userPhone) {
  const res = await callCloud('applyClub', { userId, clubId, userName, userPhone })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result
}

// 审核志愿者申请
async function reviewApplication(applicationId, action, clubId) {
  const res = await callCloud('reviewApplication', { applicationId, action, clubId })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result
}

// 创建活动
async function createActivity(clubId, clubName, activityData) {
  const res = await callCloud('createActivity', { clubId, clubName, ...activityData })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result
}

// 获取活动列表
async function getActivities(clubId, status) {
  const res = await callCloud('getActivities', { clubId, status })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 管理员获取所有用户
async function adminGetUsers(phone) {
  const res = await callCloud('adminGetUsers', { phone })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

// 初始化测试数据
async function seedData(clean = false) {
  const res = await callCloud('seedData', { clean })
  if (!res.result.success) throw new Error(res.result.error)
  return res.result.data
}

module.exports = {
  ADMIN_PHONE,
  login,
  updateUser,
  getUsers,
  saveClub,
  getClubs,
  getClub,
  getClubById,
  applyClub,
  reviewApplication,
  createActivity,
  getActivities,
  adminGetUsers,
  seedData
}
