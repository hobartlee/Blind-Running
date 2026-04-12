const app = getApp()
const api = require('../../utils/api.js')

// 演示用验证码
const DEMO_CODE = '123456'

Page({
  data: {
    step: 1,
    phone: '',
    maskedPhone: '',
    code: '',
    counting: false,
    count: 60
  },

  onLoad() {
    // 如果已登录，直接跳转到首页
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    if (isLoggedIn) {
      const userType = wx.getStorageSync('userType') || app.globalData.userType
      let homePage = '/pages/personal-info/index'
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
      }
      wx.redirectTo({ url: homePage })
      return
    }

    const userType = app.globalData.userType || 'volunteer'
    const roleNames = {
      blind: '视障跑者',
      volunteer: '志愿者',
      group: '跑团'
    }
    this.setData({ roleName: roleNames[userType] || '志愿者' })
  },

  // 手机号输入
  onPhoneInput(e) {
    const value = e.detail.value.replace(/\D/g, '')
    this.setData({ phone: value })
  },

  // 发送验证码
  sendCode() {
    const phone = this.data.phone
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' })
      return
    }

    wx.showLoading({ title: '发送中...', mask: true })

    // TODO: 调用后端发送短信验证码
    // api.sendCode(phone).then(() => {
    //   wx.hideLoading()
    //   wx.showToast({ title: '发送成功', icon: 'success' })
    // }).catch(err => {
    //   wx.hideLoading()
    //   wx.showToast({ title: '发送失败', icon: 'none' })
    // })

    // 演示：直接成功
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '验证码已发送', icon: 'success' })

      const maskedPhone = phone.slice(0, 3) + '****' + phone.slice(-4)
      this.setData({
        step: 2,
        maskedPhone,
        code: ''
      })

      this.startCountdown()
    }, 500)
  },

  // 验证码输入
  onCodeInput(e) {
    const value = e.detail.value.replace(/\D/g, '')
    this.setData({ code: value })
  },

  // 重发验证码
  resendCode() {
    if (this.data.counting) return

    wx.showToast({ title: '验证码已发送', icon: 'success' })
    this.setData({ code: '' })
    this.startCountdown()
  },

  // 倒计时
  startCountdown() {
    this.setData({ counting: true, count: 60 })

    const timer = setInterval(() => {
      const count = this.data.count - 1
      if (count <= 0) {
        clearInterval(timer)
        this.setData({ counting: false, count: 60 })
      } else {
        this.setData({ count })
      }
    }, 1000)

    this.countdownTimer = timer
  },

  // 登录
  doLogin() {
    const { phone, code } = this.data

    if (code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...', mask: true })

    // 演示模式：验证123456
    if (code !== DEMO_CODE) {
      wx.hideLoading()
      wx.showToast({ title: '验证码错误', icon: 'none' })
      return
    }

    // 调用后端登录API
    const userType = app.globalData.userType
    api.login(phone, userType).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'success' })
      this.completeLogin(phone, res)
    }).catch(() => {
      // 后端不可用时，使用本地模式登录
      wx.hideLoading()
      wx.showToast({ title: '登录成功（离线模式）', icon: 'success' })
      this.completeLoginLocal(phone)
    })
  },

  // 完成登录（后端模式）
  completeLogin(phone, user) {
    wx.setStorageSync('phone', phone)
    wx.setStorageSync('isLoggedIn', true)
    wx.setStorageSync('userId', user.id)
    wx.setStorageSync('isAdmin', user.isAdmin || false)

    // 保存用户ID到全局
    app.globalData.userId = user.id

    // 新用户计数+1（通过后端API的isNew字段判断）
    if (user.isNew) {
      const total = wx.getStorageSync('totalUsers') || 0
      wx.setStorageSync('totalUsers', total + 1)
    }

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/personal-info/index'
      })
    }, 500)
  },

  // 完成登录（离线本地模式）
  completeLoginLocal(phone) {
    wx.setStorageSync('phone', phone)
    wx.setStorageSync('isLoggedIn', true)
    wx.setStorageSync('userId', 'local_' + Date.now())
    wx.setStorageSync('isAdmin', false)

    // 本地新用户计数
    const total = wx.getStorageSync('totalUsers') || 0
    wx.setStorageSync('totalUsers', total + 1)

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/personal-info/index'
      })
    }, 500)
  },

  goBack() {
    if (this.data.step === 2) {
      this.setData({ step: 1 })
    } else {
      wx.redirectTo({
        url: '/pages/role/index'
      })
    }
  },

  onUnload() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }
})
