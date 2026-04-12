const app = getApp()

// 根据用户类型显示不同的须知内容
const missionConfig = {
  volunteer: {
    title: '志愿者服务须知',
    icon: '🤝',
    desc: '感谢您愿意帮助视障朋友跑步。您的每一次陪伴，都让他们感受到社会的温暖。',
    guideTitle: '服务准则',
    guideItems: [
      '尊重盲人朋友，保护个人隐私',
      '按时参加活动，如有变动请提前通知',
      '使用陪跑绳时确保安全',
      '活动过程中保持专注，避免使用手机',
      '积极反馈活动情况，帮助改进服务'
    ],
    agreeText: '我已阅读并同意遵守志愿者服务准则',
    submitText: '进入首页'
  },
  blind: {
    title: '视障跑者须知',
    icon: '👁',
    desc: '我们致力于为视障跑者提供安全、舒适的陪跑服务。',
    guideTitle: '跑者须知',
    guideItems: [
      '活动前请提前到达指定地点',
      '如有任何不适请及时告知志愿者',
      '遵守活动规则，确保自身安全',
      '尊重志愿者，友好沟通',
      '活动后可在平台进行评价'
    ],
    agreeText: '我已阅读并同意遵守跑者须知',
    submitText: '进入首页'
  },
  club: {
    title: '跑团服务须知',
    icon: '🏃',
    desc: '作为跑团管理员，您将负责审核志愿者、管理跑团活动，确保助盲跑服务的安全与质量。',
    guideTitle: '管理员职责',
    guideItems: [
      '审核志愿者加入申请',
      '发布和管理跑团活动',
      '确保活动安全进行',
      '处理活动中的问题与投诉',
      '维护跑团良好声誉'
    ],
    agreeText: '我已阅读并同意遵守跑团服务准则',
    submitText: '进入跑团首页'
  }
}

Page({
  data: {
    title: '',
    icon: '',
    desc: '',
    guideTitle: '',
    guideItems: [],
    agreeText: '',
    submitText: '',
    agreed: false,
    userType: null
  },

  onLoad() {
    const userType = app.globalData.userType || 'volunteer'
    const config = missionConfig[userType] || missionConfig.volunteer

    // 映射 club -> group 保持一致
    const mappedUserType = userType === 'club' ? 'group' : userType

    this.setData({
      ...config,
      userType: mappedUserType
    })
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  doSubmit() {
    if (!this.data.agreed) return

    // 标记已同意须知
    app.globalData.agreedToTerms = true
    wx.setStorageSync('agreedToTerms', true)

    const { userType } = this.data

    // 根据用户类型跳转到不同首页
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
        homePage = '/pages/blind-home/index'
    }

    // 使用 reLaunch 清除页面栈
    wx.reLaunch({
      url: homePage
    })
  },

  goBack() {
    wx.navigateBack()
  }
})