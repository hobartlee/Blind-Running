const app = getApp()

Page({
  data: {
    clubName: '朝阳公园跑团',
    clubLocation: '北京朝阳',
    memberCount: 128,
    activityCount: 36,
    helpedCount: 89,
    activities: [
      {
        id: 1,
        title: '周六朝阳公园例跑',
        dateText: '4月5日 07:00',
        location: '朝阳公园东门',
        signups: 3,
        status: 'upcoming',
        statusText: '进行中'
      },
      {
        id: 2,
        title: '周日奥森长跑',
        dateText: '4月6日 06:30',
        location: '奥森南门',
        signups: 1,
        status: 'pending',
        statusText: '待确认'
      }
    ]
  },

  onShow() {
    const joinedClub = app.globalData.joinedClub
    if (joinedClub) {
      this.setData({ clubName: joinedClub.name })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  goToHome() {
    wx.reLaunch({
      url: '/pages/volunteer-home/index'
    })
  },

  goToMy() {
    wx.reLaunch({
      url: '/pages/volunteer-my/index'
    })
  },

  goToSignups(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/volunteer-signups/index?id=${id}`
    })
  }
})