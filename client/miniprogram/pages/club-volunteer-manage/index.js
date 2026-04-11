const app = getApp()

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
    memberList: []
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    // 从本地存储加载跑团数据
    const clubData = wx.getStorageSync('clubData') || {}

    // 处理待审核列表
    const pendingList = (clubData.pendingVolunteers || []).map(v => ({
      ...v,
      gender: genderMap[v.gender] || v.gender || '',
      experience: experienceMap[v.experience] || v.experience || ''
    }))

    // 处理已加入志愿者列表
    const memberList = (clubData.volunteers || []).map(v => ({
      ...v,
      gender: genderMap[v.gender] || v.gender || '',
      experience: experienceMap[v.experience] || v.experience || ''
    }))

    this.setData({
      pendingList,
      memberList
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
          // 从待审核移到已加入
          const pendingList = this.data.pendingList.filter(v => v.id !== id)
          const memberList = [
            ...this.data.memberList,
            { ...volunteer, joinTime: new Date().toLocaleDateString() }
          ]

          this.setData({ pendingList, memberList })

          // 同步到存储
          this.syncData()

          wx.showToast({ title: '已通过', icon: 'success' })
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
          // 从待审核列表移除
          const pendingList = this.data.pendingList.filter(v => v.id !== id)

          this.setData({ pendingList })

          // 同步到存储
          this.syncData()

          wx.showToast({ title: '已拒绝', icon: 'success' })
        }
      }
    })
  },

  // 同步数据到存储
  syncData() {
    const clubData = wx.getStorageSync('clubData') || {}

    // 更新pendingVolunteers和volunteers
    clubData.pendingVolunteers = this.data.pendingList
    clubData.volunteers = this.data.memberList
    clubData.pendingCount = this.data.pendingList.length
    clubData.memberCount = this.data.memberList.length

    wx.setStorageSync('clubData', clubData)
  }
})
