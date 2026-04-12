const app = getApp()

// 性别映射
const genderMap = {
  male: '男',
  female: '女'
}

// 经验映射
const experienceMap = {
  none: '无经验',
  intermediate: '有经验',
  experienced: '经验丰富'
}

Page({
  data: {
    userInfo: {},
    maskedPhone: '',
    genderText: '',
    experienceText: ''
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo || {}
    const phone = wx.getStorageSync('phone') || ''

    // 掩码手机号（用于卡片头部显示）
    const maskedPhone = phone ? phone.slice(0, 3) + '****' + phone.slice(-4) : ''

    // 性别文本
    const genderText = genderMap[userInfo.gender] || ''

    // 经验文本
    const experienceText = experienceMap[userInfo.experience] || ''

    this.setData({
      userInfo,
      maskedPhone,
      phone, // 完整手机号
      genderText,
      experienceText
    })
  },

  goToHome() {
    wx.navigateTo({
      url: '/pages/blind-home/index'
    })
  },

  // 编辑个人信息
  editProfile() {
    wx.navigateTo({
      url: '/pages/personal-info/index'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.clearStorageSync()
          app.globalData.userType = null
          app.globalData.userInfo = null
          // 跳转到角色选择页
          wx.redirectTo({
            url: '/pages/role/index'
          })
        }
      }
    })
  }
})
