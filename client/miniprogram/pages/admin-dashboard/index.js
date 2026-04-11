const app = getApp()
const api = require('../../utils/api.js')

// 性别映射
const genderMap = {
  male: '男',
  female: '女'
}

// 经验映射
const experienceMap = {
  none: '无经验',
  beginner: '初学者',
  intermediate: '有经验',
  experienced: '经验丰富'
}

// 认证状态映射
const certStatusMap = {
  verified: '已认证',
  pending: '审核中',
  unverified: '未认证'
}

Page({
  data: {
    activeTab: 'blind',
    blindList: [],
    volunteerList: [],
    clubList: [],
    blindCount: 0,
    volunteerCount: 0,
    clubCount: 0
  },

  onLoad() {
    // 检查管理员权限
    if (!app.globalData.isAdmin) {
      wx.redirectTo({
        url: '/pages/admin-login/index'
      })
      return
    }

    this.loadData()
  },

  onShow() {
    if (!app.globalData.isAdmin) return
    this.loadData()
  },

  loadData() {
    const phone = wx.getStorageSync('phone')

    api.adminGetUsers(phone).then(data => {
      // 处理视障跑者列表
      const blindList = (data.blinds || []).map(u => ({
        ...u,
        genderText: genderMap[u.gender] || '',
        experienceText: experienceMap[u.experience] || '',
        certStatusText: certStatusMap[u.cert_status] || '未认证'
      }))

      // 处理志愿者列表
      const volunteerList = (data.volunteers || []).map(u => ({
        ...u,
        genderText: genderMap[u.gender] || '',
        experienceText: experienceMap[u.experience] || '',
        clubStatus: u.club_id ? 'joined' : 'none',
        clubStatusText: u.club_id ? '已加入跑团' : '未加入跑团'
      }))

      // 处理跑团列表
      const clubList = data.clubs || []

      this.setData({
        blindList,
        volunteerList,
        clubList,
        blindCount: blindList.length,
        volunteerCount: volunteerList.length,
        clubCount: clubList.length
      })
    }).catch(err => {
      console.error('Load admin data error:', err)
      // 降级到本地存储
      this.loadLocalData()
    })
  },

  // 本地存储降级
  loadLocalData() {
    const blindList = (wx.getStorageSync('blindUsers') || []).map(u => ({
      ...u,
      genderText: genderMap[u.gender] || '',
      experienceText: experienceMap[u.experience] || '',
      certStatusText: certStatusMap[u.certStatus] || '未认证'
    }))

    const volunteerList = (wx.getStorageSync('volunteerUsers') || []).map(u => ({
      ...u,
      genderText: genderMap[u.gender] || '',
      experienceText: experienceMap[u.experience] || '',
      clubStatus: u.clubId ? 'joined' : 'none',
      clubStatusText: u.clubId ? '已加入跑团' : '未加入跑团'
    }))

    const clubList = wx.getStorageSync('clubList') || []

    this.setData({
      blindList,
      volunteerList,
      clubList,
      blindCount: blindList.length,
      volunteerCount: volunteerList.length,
      clubCount: clubList.length
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出管理员账号吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.isAdmin = false
          wx.removeStorageSync('isAdmin')

          wx.redirectTo({
            url: '/pages/admin-login/index'
          })
        }
      }
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
