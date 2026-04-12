const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    clubName: '',
    memberCount: 0,
    pendingCount: 0,
    totalActivities: 0,
    totalHelped: 0,
    activeTab: 'activities',
    activities: [],
    pendingMembers: [],
    joinedMembers: [],
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

    // 获取跑团详情
    api.getClub(phone).then(club => {
      app.globalData.clubInfo = club

      this.setData({
        clubName: club.name || '我的跑团',
        memberCount: club.member_count || 0,
        totalActivities: club.total_activities || 0,
        totalHelped: club.total_helped || 0,
        pendingMembers: (club.pendingApplications || []).map(a => ({
          id: a.id,
          name: a.user_name,
          phone: a.user_phone,
          applyTime: a.create_time ? a.create_time.split('T')[0] : ''
        })),
        joinedMembers: (club.volunteers || []).map(v => ({
          id: v.id,
          name: v.name || '志愿者',
          phone: v.phone,
          joinTime: v.last_login ? v.last_login.split('T')[0] : ''
        })),
        activities: (club.activities || []).map(a => ({
          id: a.id,
          title: a.title,
          dateText: a.date_time ? a.date_time.replace('T', ' ').substring(0, 16) : '',
          location: a.location || '',
          status: a.status || 'upcoming',
          statusText: a.status === 'cancelled' ? '已取消' : a.status === 'completed' ? '已完成' : '进行中',
          signups: a.signup_count || 0,
          confirmed: 0
        })),
        pendingCount: (club.pendingApplications || []).length,
        isLoading: false
      })
    }).catch(err => {
      this.setData({ isLoading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
      console.error('getClub error:', err)
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  goToSignups(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/volunteer-signups/index?id=${id}`
    })
  },

  approveMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.pendingMembers.find(m => m.id === id)
    if (!member) return

    wx.showModal({
      title: '审核通过',
      content: `确认通过「${member.name}」的加入申请？`,
      success: (res) => {
        if (res.confirm) {
          this.doReview(id, 'approve')
        }
      }
    })
  },

  rejectMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.pendingMembers.find(m => m.id === id)
    if (!member) return

    wx.showModal({
      title: '拒绝申请',
      content: `确认拒绝「${member.name}」的加入申请？`,
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
      // 重新加载数据
      this.loadData()
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '操作失败', icon: 'none' })
      console.error('reviewApplication error:', err)
    })
  },

  goToMy() {
    wx.navigateTo({
      url: '/pages/club-my/index'
    })
  },

  switchRole() {
    app.globalData.userType = null
    app.globalData.userInfo = null
    wx.clearStorageSync()
    wx.reLaunch({
      url: '/pages/role/index'
    })
  }
})
