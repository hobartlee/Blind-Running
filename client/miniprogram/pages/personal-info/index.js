const app = getApp()

Page({
  data: {
    name: '',
    gender: '',
    age: '',
    experience: '',
    canSubmit: false
  },

  onLoad() {
    // 加载已有用户信息（编辑模式）
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        name: userInfo.name || '',
        gender: userInfo.gender || '',
        age: userInfo.age ? String(userInfo.age) : '',
        experience: userInfo.experience || ''
      })
      this.updateCanSubmit()
    }
  },

  onShow() {
    // 每次显示时刷新用户信息
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        name: userInfo.name || this.data.name,
        gender: userInfo.gender || this.data.gender,
        age: userInfo.age ? String(userInfo.age) : this.data.age,
        experience: userInfo.experience || this.data.experience
      })
      this.updateCanSubmit()
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
    this.updateCanSubmit()
  },

  onAgeInput(e) {
    this.setData({ age: e.detail.value })
    this.updateCanSubmit()
  },

  selectGender(e) {
    this.setData({ gender: e.currentTarget.dataset.gender })
    this.updateCanSubmit()
  },

  selectExperience(e) {
    this.setData({ experience: e.currentTarget.dataset.exp })
    this.updateCanSubmit()
  },

  updateCanSubmit() {
    const { name, gender, age, experience } = this.data
    const canSubmit = !!(name && gender && age && experience)
    this.setData({ canSubmit })
  },

  doSubmit() {
    const { name, gender, age, experience } = this.data

    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }

    if (!gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' })
      return
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 150) {
      wx.showToast({ title: '请输入正确年龄', icon: 'none' })
      return
    }

    if (!experience) {
      wx.showToast({ title: '请选择跑步经验', icon: 'none' })
      return
    }

    // 保存用户信息
    const userInfo = {
      name,
      gender,
      age: parseInt(age),
      experience,
      phone: wx.getStorageSync('phone'),
      userType: app.globalData.userType
    }

    app.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)

    console.log('用户信息:', userInfo)

    // 根据用户类型跳转到下一步
    const userType = app.globalData.userType
    let nextPage = ''

    switch (userType) {
      case 'blind':
        nextPage = '/pages/disability-proof/index'
        break
      case 'volunteer':
        nextPage = '/pages/select-club/index'
        break
      case 'group':
        nextPage = '/pages/club-register/index'
        break
      default:
        nextPage = '/pages/role/index'
    }

    wx.navigateTo({ url: nextPage })
  },

  goBack() {
    wx.navigateBack()
  }
})