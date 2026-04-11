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
    const club = this.data.clubs.find(c => c.id === clubId)

    this.setData({ selectedClubId: clubId })

    wx.showModal({
      title: '确认加入',
      content: `确定要申请加入「${club.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          app.globalData.joinedClub = club
          app.globalData.auditStatus = 'pending'

          wx.setStorageSync('joinedClub', club)
          wx.setStorageSync('auditStatus', 'pending')

          wx.showToast({
            title: '申请已提交',
            icon: 'success'
          })

          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/volunteer-home/index'
            })
          }, 1500)
        }
      }
    })
  },

  goBack() {
    wx.navigateBack()
  }
})