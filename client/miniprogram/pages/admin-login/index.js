const app = getApp()

const ADMIN_PHONE = '17610275009'

Page({
  data: {
    phone: '',
    canSubmit: false
  },

  onPhoneInput(e) {
    const value = e.detail.value.replace(/\D/g, '')
    this.setData({ phone: value })
    this.updateCanSubmit()
  },

  updateCanSubmit() {
    const { phone } = this.data
    this.setData({
      canSubmit: phone.length === 11
    })
  },

  doLogin() {
    const { phone } = this.data

    if (phone !== ADMIN_PHONE) {
      wx.showToast({ title: '非管理员账号', icon: 'none' })
      return
    }

    // 保存管理员登录状态
    app.globalData.isAdmin = true
    wx.setStorageSync('isAdmin', true)

    wx.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/admin-dashboard/index'
      })
    }, 500)
  },

  goBack() {
    wx.navigateBack()
  }
})
