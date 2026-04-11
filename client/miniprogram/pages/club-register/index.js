const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    name: '',
    location: '',
    phone: '',
    description: '',
    agreed: false,
    canSubmit: false
  },

  onLoad() {
    // 获取登录的手机号
    const phone = wx.getStorageSync('phone')
    if (phone) {
      this.setData({ phone })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
    this.updateCanSubmit()
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value })
    this.updateCanSubmit()
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value })
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
    this.updateCanSubmit()
  },

  updateCanSubmit() {
    const { name, location, phone, agreed } = this.data
    this.setData({
      canSubmit: !!(name && location && phone && agreed)
    })
  },

  doSubmit() {
    const { name, location, phone, description } = this.data

    if (!name) {
      wx.showToast({ title: '请输入跑团名称', icon: 'none' })
      return
    }

    if (!location) {
      wx.showToast({ title: '请输入跑团所在地', icon: 'none' })
      return
    }

    if (!this.data.agreed) {
      wx.showToast({ title: '请阅读并同意服务准则', icon: 'none' })
      return
    }

    wx.showLoading({ title: '入驻中...', mask: true })

    api.saveClub(phone, name, location, description).then(clubData => {
      // 保存到本地和全局
      app.globalData.clubInfo = clubData
      app.globalData.isClubAdmin = true
      app.globalData.userType = 'group'

      // 同时保存到 clubList（兼容本地逻辑）
      const clubList = wx.getStorageSync('clubList') || []
      const existIndex = clubList.findIndex(c => c.phone === phone)
      if (existIndex >= 0) {
        clubList[existIndex] = clubData
      } else {
        clubList.push(clubData)
      }
      wx.setStorageSync('clubList', clubList)

      // 初始化跑团数据
      wx.setStorageSync('clubData', {
        ...clubData,
        memberCount: 0,
        pendingCount: 0,
        pendingVolunteers: [],
        volunteers: [],
        activities: [],
        totalActivities: 0,
        totalHelped: 0
      })

      wx.hideLoading()
      wx.showToast({ title: '入驻成功', icon: 'success' })

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/club-home/index'
        })
      }, 500)
    }).catch(err => {
      wx.hideLoading()
      console.error('Register error:', err)
      wx.showToast({ title: '入驻失败', icon: 'none' })
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
