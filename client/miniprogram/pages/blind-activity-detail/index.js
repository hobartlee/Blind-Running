Page({
  data: {
    activity: {
      id: 1,
      title: '周六朝阳公园例跑',
      clubName: '朝阳公园跑团',
      dateText: '2026年4月5日',
      timeText: '07:00',
      location: '朝阳公园东门',
      durationText: '2小时',
      methodText: '引导跑步（陪跑绳）',
      note: '请提前到达集合地点，志愿者会举牌等候',
      author: '跑团管理员',
      signups: 3,
      confirmed: 1
    }
  },

  onLoad(options) {
    const id = options.id
    // TODO: 根据id加载活动数据
    console.log('加载活动详情, id:', id)
  },

  doSignup() {
    wx.showModal({
      title: '确认报名',
      content: '确定要报名参加此活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },

  goBack() {
    wx.navigateBack()
  }
})