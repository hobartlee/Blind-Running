const app = getApp()

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
    joinedMembers: []
  },

  onShow() {
    // 从全局获取跑团信息
    const clubInfo = app.globalData.clubInfo
    if (clubInfo && clubInfo.name) {
      this.setData({ clubName: clubInfo.name })
    }

    // 加载数据
    this.loadData()
  },

  loadData() {
    // TODO: 从API或本地存储加载真实数据
    const clubData = wx.getStorageSync('clubData') || {}

    this.setData({
      clubName: clubData.name || '我的跑团',
      memberCount: clubData.memberCount || 0,
      pendingCount: clubData.pendingCount || 0,
      totalActivities: clubData.totalActivities || 0,
      totalHelped: clubData.totalHelped || 0,
      activities: clubData.activities || [],
      pendingMembers: clubData.pendingMembers || [],
      joinedMembers: clubData.joinedMembers || []
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  // 注意：移除了 goToCreateActivity 函数，跑团不能发布活动

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
          // TODO: 调用API审核通过
          const pendingMembers = this.data.pendingMembers.filter(m => m.id !== id)
          const joinedMembers = [
            ...this.data.joinedMembers,
            { ...member, joinTime: new Date().toISOString().split('T')[0] }
          ]

          this.setData({
            pendingMembers,
            joinedMembers,
            memberCount: this.data.memberCount + 1,
            pendingCount: this.data.pendingCount - 1
          })

          wx.showToast({
            title: '已通过',
            icon: 'success'
          })

          // 同步到存储
          this.syncClubData()
        }
      }
    })
  },

  // 同步数据到存储
  syncClubData() {
    const clubData = {
      name: this.data.clubName,
      memberCount: this.data.memberCount,
      pendingCount: this.data.pendingCount,
      totalActivities: this.data.totalActivities,
      totalHelped: this.data.totalHelped,
      activities: this.data.activities,
      pendingMembers: this.data.pendingMembers,
      joinedMembers: this.data.joinedMembers
    }
    wx.setStorageSync('clubData', clubData)
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
