const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    clubName: '我的跑团',
    memberCount: 0,
    pendingCount: 0,
    activityCount: 0,
    helpedCount: 0,
    isLoading: false
  },

  onShow() {
    this.loadClubData()
  },

  loadClubData() {
    this.setData({ isLoading: true })
    const phone = wx.getStorageSync('phone')
    if (!phone) {
      this.setData({ isLoading: false })
      return
    }

    api.getClub(phone).then(club => {
      app.globalData.clubInfo = club
      this.setData({
        clubName: club.name || '我的跑团',
        memberCount: club.member_count || 0,
        pendingCount: (club.pendingApplications || []).length,
        activityCount: club.total_activities || 0,
        helpedCount: club.total_helped || 0,
        isLoading: false
      })
    }).catch(err => {
      this.setData({ isLoading: false })
      console.error('getClub error:', err)
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
