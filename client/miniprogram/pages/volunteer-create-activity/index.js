Page({
  data: {
    date: '',
    time: '',
    location: '',
    duration: 2,
    durationText: '2小时',
    experience: 'any',
    experienceText: '不限经验',
    durations: ['1小时', '2小时', '3小时', '4小时以上'],
    experiences: [
      { value: 'any', label: '不限经验' },
      { value: 'beginner', label: '有跑步经验' },
      { value: 'intermediate', label: '有半年以上经验' },
      { value: 'advanced', label: '有一年以上经验' }
    ]
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onDurationChange(e) {
    const durationText = this.data.durations[e.detail.value]
    this.setData({ durationText })
  },

  onExperienceChange(e) {
    const experience = this.data.experiences[e.detail.value]
    this.setData({
      experience: experience.value,
      experienceText: experience.label
    })
  },

  doSubmit() {
    const { date, time, location } = this.data

    if (!location) {
      wx.showToast({ title: '请输入集合地点', icon: 'none' })
      return
    }

    if (!date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    if (!time) {
      wx.showToast({ title: '请选择开始时间', icon: 'none' })
      return
    }

    // TODO: 调用后端创建活动
    wx.showToast({
      title: '活动发布成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  goBack() {
    wx.navigateBack()
  }
})
