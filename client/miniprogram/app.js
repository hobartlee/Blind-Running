App({
  globalData: {
    user: null,
    userType: null, // 'blind', 'volunteer', or 'group'
    userInfo: null
  },
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-6geqajt41adff602',
      traceUser: true
    })

    // 恢复登录状态
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    const userType = wx.getStorageSync('userType')
    const userInfo = wx.getStorageSync('userInfo')

    if (isLoggedIn && userType) {
      this.globalData.userType = userType
      this.globalData.userInfo = userInfo || {}
      console.log('已恢复登录状态:', userType)
    }
  }
})