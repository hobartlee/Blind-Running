const app = getApp()

Page({
  data: {
    name: '',
    gender: '',
    experience: ''
  },

  onLoad() {
    // 加载已有用户信息
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      name: userInfo.name || '',
      gender: userInfo.gender || '',
      experience: userInfo.experience || ''
    })
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.gender })
  },

  selectExperience(e) {
    this.setData({ experience: e.currentTarget.dataset.exp })
  },

  doSave() {
    const { name, gender, experience } = this.data

    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }

    if (!gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' })
      return
    }

    if (!experience) {
      wx.showToast({ title: '请选择跑步经验', icon: 'none' })
      return
    }

    // 保存用户信息
    const userInfo = app.globalData.userInfo || {}
    userInfo.name = name
    userInfo.gender = gender
    userInfo.experience = experience

    app.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)

    wx.showToast({ title: '保存成功', icon: 'success' })

    setTimeout(() => {
      wx.navigateBack()
    }, 500)
  },

  goBack() {
    wx.navigateBack()
  }
})
