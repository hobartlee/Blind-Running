const app = getApp()

Page({
  data: {},

  goBack() {
    wx.navigateBack()
  },

  // 登录已有跑团
  goToLogin() {
    wx.navigateTo({
      url: '/pages/club-login/index'
    })
  },

  // 创建新跑团
  goToRegister() {
    wx.navigateTo({
      url: '/pages/club-register/index'
    })
  }
})
