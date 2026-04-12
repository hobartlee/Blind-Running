const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    auditStatus: null, // 'pending' | 'approved'
    clubName: '',
    joinedClub: null,
    activityCount: 0,
    hours: 0,
    filter: 'all',
    filteredActivities: [],
    activities: [],
    isLoading: false
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({ isLoading: true })

    // 先获取当前用户信息，包含club_id
    const phone = wx.getStorageSync('phone')
    const userType = wx.getStorageSync('userType')

    if (!phone) {
      this.setData({ isLoading: false })
      return
    }

    // 获取用户详情
    api.getUsers(userType).then(users => {
      const currentUser = (users || []).find(u => u.phone === phone)
      if (currentUser && currentUser.club_id) {
        // 用户已有俱乐部
        app.globalData.joinedClub = { id: currentUser.club_id, name: currentUser.club_name }
        app.globalData.auditStatus = 'approved'

        this.setData({
          joinedClub: { id: currentUser.club_id, name: currentUser.club_name },
          clubName: currentUser.club_name,
          auditStatus: 'approved'
        })

        // 加载俱乐部活动
        this.loadActivities(currentUser.club_id)
      } else {
        this.setData({
          joinedClub: null,
          auditStatus: null,
          activities: [],
          activityCount: 0,
          isLoading: false
        })
      }
    }).catch(() => {
      // API失败时使用本地数据
      this.loadActivitiesLocal()
    })
  },

  // 从API加载活动
  loadActivities(clubId) {
    api.getActivities(clubId).then(activities => {
      const formatted = (activities || []).map(a => ({
        id: a.id,
        title: a.title,
        date: a.date_time ? a.date_time.split('T')[0] : '',
        time: a.date_time ? a.date_time.split('T')[1]?.substring(0, 5) : '',
        location: a.location,
        status: a.status || 'upcoming',
        signupCount: a.signup_count || 0
      }))

      this.setData({
        activities: formatted,
        activityCount: formatted.length,
        isLoading: false
      }, () => {
        this.applyFilter()
      })
    }).catch(() => {
      this.loadActivitiesLocal()
    })
  },

  // 从本地存储加载活动（备用）
  loadActivitiesLocal() {
    const activities = wx.getStorageSync('volunteerActivities') || []
    this.setData({
      activities,
      activityCount: activities.length,
      isLoading: false
    }, () => {
      this.applyFilter()
    })
  },

  // 计算活动状态
  getActivityStatus(activity) {
    if (activity.status === 'cancelled') return 'cancelled'
    if (activity.status === 'completed') return 'completed'

    if (activity.hasMatched) {
      return 'matched'
    }

    if (activity.signups > 0) return 'pending'
    return 'upcoming'
  },

  // 应用筛选
  applyFilter() {
    const { activities, filter } = this.data
    let filtered = []

    if (filter === 'all') {
      filtered = activities
    } else if (filter === 'in_progress') {
      filtered = activities.filter(a =>
        a.status === 'upcoming' || a.status === 'pending' || a.status === 'matched'
      )
    } else if (filter === 'completed') {
      filtered = activities.filter(a =>
        a.status === 'completed' || a.status === 'cancelled'
      )
    }

    this.setData({ filteredActivities: filtered })
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filter }, () => {
      this.applyFilter()
    })
  },

  // 取消活动
  cancelActivity(e) {
    const id = e.currentTarget.dataset.id
    const activity = this.data.activities.find(a => a.id === id)

    wx.showModal({
      title: '取消活动',
      content: '确认取消该活动？取消后需电话联络已报名的视障跑者通知对方。',
      confirmText: '确认取消',
      cancelText: '不取消',
      success: (res) => {
        if (res.confirm) {
          const activities = this.data.activities.map(a => {
            if (a.id === id) {
              return { ...a, status: 'cancelled', statusText: '已取消' }
            }
            return a
          })
          this.setData({ activities }, () => {
            this.applyFilter()
          })

          // TODO: 同步到存储
          wx.setStorageSync('volunteerActivities', activities)

          wx.showToast({
            title: '活动已取消',
            icon: 'success'
          })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  goToJoinClub() {
    wx.navigateTo({
      url: '/pages/volunteer-join-club/index'
    })
  },

  goToMyClub() {
    wx.navigateTo({
      url: '/pages/volunteer-my-club/index'
    })
  },

  goToCreateActivity() {
    wx.navigateTo({
      url: '/pages/volunteer-create-activity/index'
    })
  },

  goToSignups(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/volunteer-signups/index?id=${id}`
    })
  },

  goToMy() {
    wx.navigateTo({
      url: '/pages/volunteer-my/index'
    })
  },

  switchRole() {
    app.globalData.userType = null
    app.globalData.userInfo = null
    wx.clearStorageSync()
    wx.reLaunch({
      url: '/pages/role/index'
    })
  }
})
