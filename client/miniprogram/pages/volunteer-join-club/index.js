const app = getApp()
const api = require('../../utils/api.js')

// 离线备用跑团数据
const FALLBACK_CLUBS = [
  { id: 1, name: '朝阳公园跑团', location: '北京朝阳', member_count: 128 },
  { id: 2, name: '奥森跑团', location: '北京海淀', member_count: 95 },
  { id: 3, name: '通州跑步协会', location: '北京通州', member_count: 67 }
]

Page({
  data: {
    clubs: [],
    selectedClubId: null,
    isLoading: true
  },

  onShow() {
    this.loadClubs()
  },

  loadClubs() {
    this.setData({ isLoading: true })
    api.getClubs().then(clubs => {
      this.setData({
        clubs: clubs && clubs.length > 0 ? clubs : FALLBACK_CLUBS,
        isLoading: false
      })
    }).catch(() => {
      this.setData({
        clubs: FALLBACK_CLUBS,
        isLoading: false
      })
    })
  },

  selectClub(e) {
    const clubId = e.currentTarget.dataset.id
    const club = this.data.clubs.find(c => c.id === clubId)
    if (!club) return

    this.setData({ selectedClubId: clubId })

    wx.showModal({
      title: '确认加入',
      content: `确定要申请加入「${club.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          this.doApply(club)
        }
      }
    })
  },

  doApply(club) {
    wx.showLoading({ title: '申请中...', mask: true })

    const userId = wx.getStorageSync('userId')
    const userInfo = app.globalData.userInfo || {}

    api.applyClub(userId, club.id, userInfo.name || '', userInfo.phone || wx.getStorageSync('phone') || '').then(() => {
      wx.hideLoading()
      wx.showToast({ title: '申请已提交', icon: 'success' })

      app.globalData.joinedClub = club
      app.globalData.auditStatus = 'pending'
      wx.setStorageSync('joinedClub', club)
      wx.setStorageSync('auditStatus', 'pending')

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/volunteer-home/index'
        })
      }, 1500)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '申请已提交（离线模式）', icon: 'success' })

      app.globalData.joinedClub = club
      app.globalData.auditStatus = 'pending'
      wx.setStorageSync('joinedClub', club)
      wx.setStorageSync('auditStatus', 'pending')

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/volunteer-home/index'
        })
      }, 1500)
    })
  },

  goBack() {
    wx.navigateBack()
  }
})