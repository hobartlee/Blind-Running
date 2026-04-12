const app = getApp()
const api = require('../../utils/api.js')

// 计算两点之间的距离（单位：公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

// 格式化距离显示
function formatDistance(km) {
  if (km < 1) {
    return Math.round(km * 1000) + 'm'
  } else if (km < 10) {
    return km.toFixed(1) + 'km'
  } else {
    return Math.round(km) + 'km'
  }
}

Page({
  data: {
    userName: '',
    mySignups: [],
    activities: [],
    isLoading: false,
    hasLocation: false
  },

  onShow() {
    // 从全局获取用户信息
    const userInfo = app.globalData.userInfo
    if (userInfo && userInfo.name) {
      this.setData({ userName: userInfo.name })
    }

    // 加载数据
    this.loadData()

    // 获取用户位置
    this.getUserLocation()
  },

  loadData() {
    this.setData({ isLoading: true })

    // 从API加载活动列表
    api.getActivities().then(activities => {
      const formatted = (activities || []).map(a => ({
        id: a.id,
        title: a.title,
        clubName: a.club_name,
        date: a.date_time ? a.date_time.split('T')[0] : '',
        time: a.date_time ? a.date_time.split('T')[1]?.substring(0, 5) : '',
        location: a.location,
        status: a.status || 'upcoming',
        signupCount: a.signup_count || 0,
        latitude: a.latitude,
        longitude: a.longitude
      }))

      // 计算每个活动到用户的距离
      const withDistance = this.calculateActivitiesDistance(formatted)

      this.setData({
        activities: withDistance,
        mySignups: wx.getStorageSync('mySignups') || [],
        isLoading: false
      })
    }).catch(() => {
      // 失败时使用本地存储
      const mySignups = wx.getStorageSync('mySignups') || []
      const activities = wx.getStorageSync('activities') || []
      const withDistance = this.calculateActivitiesDistance(activities)
      this.setData({
        mySignups,
        activities: withDistance,
        isLoading: false
      })
    })
  },

  // 获取用户位置
  getUserLocation() {
    // 检查是否已授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          // 未授权，弹窗请求授权
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.doGetLocation()
            },
            fail: () => {
              // 用户拒绝授权
              this.setData({ hasLocation: false })
            }
          })
        } else {
          // 已授权
          this.doGetLocation()
        }
      },
      fail: () => {
        this.setData({ hasLocation: false })
      }
    })
  },

  doGetLocation() {
    wx.getLocation({
      type: 'gcj02', // 火星坐标系
      success: (res) => {
        const userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        // 存储到全局
        app.globalData.userLocation = userLocation
        this.setData({ hasLocation: true })

        // 重新计算活动距离
        this.updateActivitiesDistance(userLocation)
      },
      fail: () => {
        this.setData({ hasLocation: false })
      }
    })
  },

  // 计算活动的距离
  calculateActivitiesDistance(activities) {
    const userLocation = app.globalData.userLocation

    return activities.map(activity => {
      if (userLocation && activity.latitude && activity.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          activity.latitude,
          activity.longitude
        )
        return {
          ...activity,
          distance: formatDistance(distance)
        }
      }
      return activity
    })
  },

  // 更新活动距离（带动画效果）
  updateActivitiesDistance(userLocation) {
    const activities = this.data.activities
    const updatedActivities = activities.map(activity => {
      if (activity.latitude && activity.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          activity.latitude,
          activity.longitude
        )
        return {
          ...activity,
          distance: formatDistance(distance)
        }
      }
      return activity
    })

    this.setData({ activities: updatedActivities })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData()
    this.getUserLocation()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 500)
  },

  goToActivityDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/blind-activity-detail/index?id=${id}`
    })
  },

  goToSignupStatus(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/blind-signup-status/index?id=${id}`
    })
  },

  goToMy() {
    wx.navigateTo({
      url: '/pages/blind-my/index'
    })
  },

  switchRole() {
    app.globalData.userType = null
    app.globalData.userInfo = null
    wx.clearStorageSync()
    wx.reLaunch({
      url: '/pages/role/index'
    })
  }
})
