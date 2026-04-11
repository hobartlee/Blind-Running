Page({
  data: {
    name: '',
    date: '',
    time: '07:00',
    location: '',
    type: 'regular',
    typeText: '例跑活动',
    duration: '2',
    durationText: '2 小时',
    note: '',
    types: [
      { value: 'regular', label: '例跑活动' },
      { value: 'special', label: '特殊活动' }
    ],
    durations: ['1 小时', '2 小时', '3 小时', '4 小时以上']
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onLocationInput(e) {
    this.setData({ location: e.detail.value })
  },

  onTypeChange(e) {
    const type = this.data.types[e.detail.value]
    this.setData({
      type: type.value,
      typeText: type.label
    })
  },

  onDurationChange(e) {
    const durations = ['1', '2', '3', '4']
    const duration = durations[e.detail.value]
    const durationText = this.data.durations[e.detail.value]
    this.setData({ duration, durationText })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  doSubmit() {
    const { name, date, time, location } = this.data

    if (!name) {
      wx.showToast({ title: '请输入活动名称', icon: 'none' })
      return
    }

    if (!date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }

    if (!location) {
      wx.showToast({ title: '请输入地点', icon: 'none' })
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