const app = getApp()

Page({
  data: {
    clubs: [
      { id: 1, name: '朝阳公园跑团', location: '北京朝阳', members: 128 },
      { id: 2, name: '奥森跑团', location: '北京海淀', members: 95 },
      { id: 3, name: '通州跑步协会', location: '北京通州', members: 67 }
    ],
    selectedClubId: null
  },

  selectClub(e) {
    const clubId = e.currentTarget.dataset.id
    this.setData({ selectedClubId: clubId })
  },

  doJoin() {
    if (!this.data.selectedClubId) return

    const club = this.data.clubs.find(c => c.id === this.data.selectedClubId)
    if (!club) return

    // 保存申请信息
    app.globalData.joinedClub = club
    app.globalData.auditStatus = 'pending'

    wx.setStorageSync('joinedClub', club)
    wx.setStorageSync('auditStatus', 'pending')

    // 跳转到服务须知页面
    wx.navigateTo({
      url: '/pages/platform-mission/index'
    })
  },

  goBack() {
    wx.navigateBack()
  }
})