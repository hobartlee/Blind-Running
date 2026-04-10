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

    // 掩码手机号
    const maskedPhone = phone ? phone.slice(0, 3) + '****' + phone.slice(-4) : ''

    // 性别文本
    const genderText = genderMap[userInfo.gender] || ''

    // 经验文本
    const experienceText = experienceMap[userInfo.experience] || ''

    this.setData({
      userInfo,
      maskedPhone,
      genderText,
      experienceText
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

  // 编辑个人信息
  editProfile() {
    wx.navigateTo({
      url: '/pages/volunteer-profile-edit/index'
    })
  }
})
