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

Page({
  data: {
    activeTab: 'pending',
    pendingList: [],
    memberList: [],
    isLoading: false
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({ isLoading: true })
    const phone = wx.getStorageSync('phone')
    if (!phone) {
      this.setData({ isLoading: false })
      return
    }

    api.getClub(phone).then(club => {
      const pendingList = (club.pendingApplications || []).map(a => ({
        id: a.id,
        name: a.user_name || '志愿者',
        phone: a.user_phone || '',
        gender: genderMap[a.gender] || '',
        experience: experienceMap[a.experience] || ''
      }))

      const memberList = (club.volunteers || []).map(v => ({
        id: v.id,
        name: v.name || '志愿者',
        phone: v.phone || '',
        gender: genderMap[v.gender] || '',
        experience: experienceMap[v.experience] || ''
      }))

      this.setData({
        pendingList,
        memberList,
        isLoading: false
      })
    }).catch(err => {
      this.setData({ isLoading: false })
      console.error('getClub error:', err)
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  goBack() {
    wx.navigateBack()
  },

  // 通过志愿者申请
  approveVolunteer(e) {
    const id = e.currentTarget.dataset.id
    const volunteer = this.data.pendingList.find(v => v.id === id)
    if (!volunteer) return

    wx.showModal({
      title: '审核通过',
      content: `确认通过「${volunteer.name}」的加入申请？`,
      success: (res) => {
        if (res.confirm) {
          this.doReview(id, 'approve')
        }
      }
    })
  },

  // 拒绝志愿者申请
  rejectVolunteer(e) {
    const id = e.currentTarget.dataset.id
    const volunteer = this.data.pendingList.find(v => v.id === id)
    if (!volunteer) return

    wx.showModal({
      title: '拒绝申请',
      content: `确定拒绝「${volunteer.name}」的加入申请？`,
      success: (res) => {
        if (res.confirm) {
          this.doReview(id, 'reject')
        }
      }
    })
  },

  doReview(applicationId, action) {
    const phone = wx.getStorageSync('phone')
    wx.showLoading({ title: '处理中...', mask: true })

    api.getClub(phone).then(club => {
      return api.reviewApplication(applicationId, action, club.id)
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: action === 'approve' ? '已通过' : '已拒绝', icon: 'success' })
      this.loadData()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '操作失败', icon: 'none' })
      console.error('reviewApplication error:', err)
    })
  }
})
