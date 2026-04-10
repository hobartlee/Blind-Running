Page({
  data: {
    // 当前流程步骤 (1=待确认同行, 2=已确认待出行, 3=匹配成功待出行, 4=出行完成)
    step: 2,
    signup: {
      id: 1,
      // 状态: 0(待确认同行), 1(已确认待出行), 2(匹配成功待出行), 3(出行完成)
      status: 1,
      statusIcon: '✓',
      statusTitle: '已确认待出行',
      statusDesc: '志愿者已确认，请按时到达集合点'
    },
    activity: {
      title: '周六朝阳公园助盲跑',
      dateText: '4月11日 周六',
      timeText: '07:00',
      location: '朝阳公园东门',
      durationText: '2小时',
      author: '跑团管理员',
      clubName: '朝阳公园跑团',
      volunteerPhone: '137****2222'
    },
    volunteer: {
      name: '张三',
      clubName: '朝阳公园跑团',
      online: true,
      activities: 12,
      hours: 28,
      rating: '4.9',
      phone: '137****2222'
    }
  },

  // 模拟不同状态的测试方法
  setSignupStatus(status) {
    const statusMap = {
      0: {
        status: 0,
        statusIcon: '📝',
        statusTitle: '待确认同行',
        statusDesc: '等待跑团确认您的报名申请'
      },
      1: {
        status: 1,
        statusIcon: '✓',
        statusTitle: '已确认待出行',
        statusDesc: '志愿者已确认，请按时到达集合点'
      },
      2: {
        status: 2,
        statusIcon: '⏳',
        statusTitle: '匹配成功待出行',
        statusDesc: '已匹配成功，请等待同行'
      },
      3: {
        status: 3,
        statusIcon: '🎉',
        statusTitle: '出行完成',
        statusDesc: '感谢您参与本次活动，祝您跑步愉快！'
      }
    }

    this.setData({
      step: status + 1,
      signup: statusMap[status]
    })
  },

  onLoad(options) {
    const id = options.id
    const status = parseInt(options.status || '1')

    // 根据状态设置显示内容
    this.setSignupStatus(status)

    console.log('加载报名状态, id:', id, 'status:', status)
  },

  // 复制志愿者电话
  copyPhone() {
    const phone = this.data.activity.volunteerPhone || '138****1234'
    wx.setClipboardData({
      data: phone,
      success: () => {
        wx.showToast({
          title: '已复制电话',
          icon: 'success'
        })
      }
    })
  },

  // 确认按钮（根据当前状态推进）
  confirmAction() {
    const currentStep = this.data.step
    if (currentStep < 4) {
      const nextStatus = currentStep
      this.setSignupStatus(nextStatus)
      wx.showToast({
        title: '已更新状态',
        icon: 'success'
      })
    }
  },

  cancelSignup() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已取消报名',
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
