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

    // TODO: 调用后端验证验证码
    // api.verifyCode(phone, code).then(() => {
    //   this.completeLogin(phone)
    // }).catch(err => {
    //   wx.hideLoading()
    //   wx.showToast({ title: '验证码错误', icon: 'none' })
    // })

    // 演示：验证码正确
    setTimeout(() => {
      wx.hideLoading()
      if (code === DEMO_CODE) {
        wx.showToast({ title: '登录成功', icon: 'success' })
        this.completeLogin(phone)
      } else {
        wx.showToast({ title: '验证码错误', icon: 'none' })
      }
    }, 500)
  },

  // 完成登录
  completeLogin(phone) {
    wx.setStorageSync('phone', phone)
    wx.setStorageSync('isLoggedIn', true)

    const userType = app.globalData.userType

    // 保存用户
    if (userType === 'blind') {
      const blindUsers = wx.getStorageSync('blindUsers') || []
      const existIndex = blindUsers.findIndex(u => u.phone === phone)
      if (existIndex >= 0) {
        blindUsers[existIndex].lastLogin = new Date().toLocaleString()
      } else {
        blindUsers.push({
          id: Date.now(),
          phone,
          createTime: new Date().toLocaleString(),
          lastLogin: new Date().toLocaleString()
        })
      }
      wx.setStorageSync('blindUsers', blindUsers)
    } else if (userType === 'volunteer') {
      const volunteerUsers = wx.getStorageSync('volunteerUsers') || []
      const existIndex = volunteerUsers.findIndex(u => u.phone === phone)
      if (existIndex >= 0) {
        volunteerUsers[existIndex].lastLogin = new Date().toLocaleString()
      } else {
        volunteerUsers.push({
          id: Date.now(),
          phone,
          createTime: new Date().toLocaleString(),
          lastLogin: new Date().toLocaleString()
        })
      }
      wx.setStorageSync('volunteerUsers', volunteerUsers)
    }

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
