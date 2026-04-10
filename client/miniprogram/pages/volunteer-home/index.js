const app = getApp()

Page({
  data: {
    auditStatus: null, // 'pending' | 'approved'
    clubName: '',
    joinedClub: null,
    activityCount: 0,
    hours: 0,
    filter: 'all',
    filteredActivities: [],
    activities: []
  },

  onShow() {
    // 从全局获取跑团信息
    const joinedClub = app.globalData.joinedClub
    const auditStatus = app.globalData.auditStatus

    if (joinedClub) {
      this.setData({
        joinedClub,
        clubName: joinedClub.name,
        auditStatus: auditStatus || 'approved'
      })
    } else {
      this.setData({
        joinedClub: null,
        auditStatus: null
      })
    }

    // 加载活动数据
    this.loadActivities()
  },

  // 加载活动数据
  loadActivities() {
    // TODO: 从API或本地存储加载真实数据
    const activities = wx.getStorageSync('volunteerActivities') || []

    this.setData({
      activities,
      activityCount: activities.length,
      hours: 0 // TODO: 从实际数据计算
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
    this.loadActivities()
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
