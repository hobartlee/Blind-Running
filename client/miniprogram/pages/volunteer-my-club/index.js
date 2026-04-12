const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    clubName: '',
    clubLocation: '',
    memberCount: 0,
    activityCount: 0,
    helpedCount: 0,
    activities: [],
    isLoading: false
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({ isLoading: true })
    const joinedClub = app.globalData.joinedClub

    if (!joinedClub || !joinedClub.id) {
      this.setData({ isLoading: false })
      return
    }

    // 按ID获取跑团详情
    api.getClubById(joinedClub.id).then(club => {
      this.setData({
        clubName: club.name || '',
        clubLocation: club.location || '',
        memberCount: club.member_count || 0,
        activityCount: club.total_activities || 0,
        helpedCount: club.total_helped || 0,
        activities: (club.activities || []).map(a => ({
          id: a.id,
          title: a.title,
          dateText: a.date_time ? a.date_time.replace('T', ' ').substring(0, 16) : '',
          location: a.location,
          signups: a.signup_count || 0,
          status: a.status || 'upcoming'
        })),
        isLoading: false
      })
    }).catch(err => {
      this.setData({ isLoading: false })
      console.error('getClubById error:', err)
    })
  },

  goBack() {
    wx.navigateBack()
  },

  goToHome() {
    wx.reLaunch({
      url: '/pages/volunteer-home/index'
    })
  },

  goToMy() {
    wx.reLaunch({
      url: '/pages/volunteer-my/index'
    })
  },

  goToSignups(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/volunteer-signups/index?id=${id}`
    })
  }
})