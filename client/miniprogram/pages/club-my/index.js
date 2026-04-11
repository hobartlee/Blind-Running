const app = getApp()

Page({
  data: {
    clubName: '我的跑团',
    memberCount: 0,
    pendingCount: 0,
    activityCount: 36,
    helpedCount: 89
  },

  onShow() {
    const clubInfo = app.globalData.clubInfo
    if (clubInfo && clubInfo.name) {
      this.setData({ clubName: clubInfo.name })
    }

    // 加载跑团数据
    this.loadClubData()
  },

  loadClubData() {
    // 从本地存储加载
    const clubData = wx.getStorageSync('clubData') || {}

    this.setData({
      memberCount: clubData.memberCount || 0,
      pendingCount: clubData.pendingCount || 0,
      activityCount: clubData.totalActivities || 36,
      helpedCount: clubData.totalHelped || 89
    })
  },

  goBack() {
    wx.navigateBack()
  },

  goToHome() {
    wx.reLaunch({
      url: '/pages/club-home/index'
    })
  },

  // 志愿者管理
  goToVolunteerManage() {
    wx.navigateTo({
      url: '/pages/club-volunteer-manage/index'
    })
  }
})
