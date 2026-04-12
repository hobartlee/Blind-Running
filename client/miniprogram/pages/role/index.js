const app = getApp()

const BASE_USERS = 442

Page({
  data: {
    totalUsers: BASE_USERS
  },

  onShow() {
    // 检查是否已登录，已登录则跳转到对应首页
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    const userType = wx.getStorageSync('userType')

    // 读取注册人数
    const extraUsers = wx.getStorageSync('totalUsers') || 0
    this.setData({ totalUsers: BASE_USERS + extraUsers })

    if (isLoggedIn && userType) {
      let homePage = ''
      switch (userType) {
        case 'blind':
          homePage = '/pages/blind-home/index'
          break
        case 'volunteer':
          homePage = '/pages/volunteer-home/index'
          break
        case 'group':
          homePage = '/pages/club-home/index'
          break
        default:
          return
      }
      wx.redirectTo({ url: homePage })
    }
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role

    // 显示加载提示
    wx.showLoading({
      title: '进入中...',
      mask: true
    })

    // 保存角色到全局
    app.globalData.userType = role
    wx.setStorageSync('userType', role)

    // 跑团进入入驻选择页
    if (role === 'group') {
      wx.redirectTo({
        url: '/pages/club-entry/index'
      })
      return
    }

    // 视障跑者和志愿者走手机登录流程
    wx.redirectTo({
      url: '/pages/login/index',
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '进入失败',
          icon: 'none'
        })
      }
    })

    // 隐藏 loading（如果 redirectTo 失败）
    setTimeout(() => {
      wx.hideLoading()
    }, 500)
  }
})
