const app = getApp()

Page({
  data: {
    hasProof: null,
    showHint: false,
    canSubmit: false
  },

  selectProof(e) {
    const value = e.currentTarget.dataset.value === 'true'
    this.setData({
      hasProof: value,
      showHint: !value,
      canSubmit: true
    })

    app.globalData.hasDisabilityProof = value
  },

  doNext() {
    if (!this.data.canSubmit) return

    // 跳转到服务须知页面
    wx.navigateTo({
      url: '/pages/platform-mission/index'
    })
  },

  goBack() {
    wx.navigateBack()
  }
})