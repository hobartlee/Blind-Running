Page({
  data: {
    activity: {
      id: 1,
      title: '周六朝阳公园助盲跑',
      dateText: '4月11日 07:00'
    },
    totalCount: 3,
    pendingCount: 2,
    acceptedCount: 1,
    completedCount: 0,
    pendingMembers: [
      { id: 1, name: '李明', meta: '视障跑者 · 3年跑步经验', experience: '有跑步经验' },
      { id: 2, name: '王芳', meta: '视障跑者 · 新用户', experience: '不限经验' }
    ],
    acceptedMembers: [
      { id: 3, name: '赵六', meta: '视障跑者 · 1年跑步经验' }
    ],
    completedMembers: []
  },

  onLoad(options) {
    const id = options.id
    console.log('加载报名列表, 活动id:', id)
  },

  sendRemind() {
    wx.showToast({
      title: '已发送提醒',
      icon: 'success'
    })
  },

  acceptMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.pendingMembers.find(m => m.id === id)

    wx.showModal({
      title: '接受报名',
      content: `确认接受「${member.name}」的报名？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已接受',
            icon: 'success'
          })
          // 模拟移动到已接受列表
          setTimeout(() => {
            this.updateMemberStatus(id, 'accepted')
          }, 1000)
        }
      }
    })
  },

  rejectMember(e) {
    const id = e.currentTarget.dataset.id
    const member = this.data.pendingMembers.find(m => m.id === id)

    wx.showModal({
      title: '拒绝报名',
      content: `确认拒绝「${member.name}」的报名？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已拒绝',
            icon: 'success'
          })
          // 模拟从列表移除
          setTimeout(() => {
            this.removeMember(id)
          }, 1000)
        }
      }
    })
  },

  updateMemberStatus(id, status) {
    const pendingMembers = this.data.pendingMembers.filter(m => m.id !== id)
    const member = this.data.pendingMembers.find(m => m.id === id)

    let acceptedMembers = this.data.acceptedMembers
    let acceptedCount = this.data.acceptedCount

    if (status === 'accepted') {
      acceptedMembers = [...acceptedMembers, member]
      acceptedCount += 1
    }

    this.setData({
      pendingMembers,
      acceptedMembers,
      pendingCount: this.data.pendingCount - 1,
      acceptedCount,
      totalCount: this.data.totalCount
    })
  },

  removeMember(id) {
    const pendingMembers = this.data.pendingMembers.filter(m => m.id !== id)
    this.setData({
      pendingMembers,
      pendingCount: this.data.pendingCount - 1,
      totalCount: this.data.totalCount - 1
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
