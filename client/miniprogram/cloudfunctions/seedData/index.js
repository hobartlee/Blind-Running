const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 清理旧数据（可选，生产环境请删除这段）
    if (event.clean) {
      await db.collection('users').where({}).remove()
      await db.collection('clubs').where({}).remove()
      await db.collection('activities').where({}).remove()
      await db.collection('volunteer_applications').where({}).remove()
    }

    // 1. 创建测试跑团
    const clubs = [
      {
        name: '朝阳公园跑团',
        phone: '13800138001',
        location: '北京市朝阳区朝阳公园',
        description: '专业陪盲人跑步的志愿者跑团，每周末组织活动',
        member_count: 12,
        total_activities: 5,
        total_helped: 28,
        create_time: db.serverDate()
      },
      {
        name: '奥森星光跑团',
        phone: '13800138002',
        location: '北京市朝阳区奥林匹克森林公园',
        description: '致力于帮助视障人士实现跑步梦想',
        member_count: 8,
        total_activities: 3,
        total_helped: 15,
        create_time: db.serverDate()
      }
    ]

    const clubResults = []
    for (const club of clubs) {
      const res = await db.collection('clubs').add({ data: club })
      clubResults.push({ id: res._id, ...club })
    }

    // 2. 创建测试用户
    const users = [
      {
        phone: '13900000001',
        user_type: 'blind',
        name: '张三',
        gender: '男',
        age: 35,
        experience: 2,
        create_time: db.serverDate()
      },
      {
        phone: '13900000002',
        user_type: 'blind',
        name: '李四',
        gender: '女',
        age: 28,
        experience: 1,
        create_time: db.serverDate()
      },
      {
        phone: '13900000003',
        user_type: 'volunteer',
        name: '王小明',
        gender: '男',
        age: 30,
        experience: 5,
        club_id: clubResults[0].id,
        club_name: clubResults[0].name,
        create_time: db.serverDate()
      },
      {
        phone: '13900000004',
        user_type: 'volunteer',
        name: '李小红',
        gender: '女',
        age: 26,
        experience: 3,
        club_id: clubResults[0].id,
        club_name: clubResults[0].name,
        create_time: db.serverDate()
      },
      {
        phone: '13900000005',
        user_type: 'volunteer',
        name: '赵大力',
        gender: '男',
        age: 40,
        experience: 8,
        club_id: clubResults[1].id,
        club_name: clubResults[1].name,
        create_time: db.serverDate()
      }
    ]

    const userResults = []
    for (const user of users) {
      const res = await db.collection('users').add({ data: user })
      userResults.push({ id: res._id, ...user })
    }

    // 3. 创建测试活动
    const now = new Date()
    const activities = [
      {
        club_id: clubResults[0].id,
        club_name: clubResults[0].name,
        title: '周末朝阳公园陪跑活动',
        description: '帮助视障跑者完成5公里跑步，招募有经验的志愿者',
        date_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: '北京市朝阳区朝阳公园东门',
        latitude: 39.928,
        longitude: 116.457,
        status: 'upcoming',
        signup_count: 2,
        create_time: db.serverDate()
      },
      {
        club_id: clubResults[0].id,
        club_name: clubResults[0].name,
        title: '夜间跑步训练',
        description: '专业配速训练，帮助盲人朋友提高跑步能力',
        date_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: '北京市朝阳区朝阳公园南门',
        latitude: 39.925,
        longitude: 116.459,
        status: 'upcoming',
        signup_count: 0,
        create_time: db.serverDate()
      },
      {
        club_id: clubResults[1].id,
        club_name: clubResults[1].name,
        title: '奥森10公里陪跑',
        description: '全程陪护，确保视障跑者安全完成10公里',
        date_time: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: '北京市朝阳区奥林匹克森林公园南园',
        latitude: 39.987,
        longitude: 116.407,
        status: 'upcoming',
        signup_count: 1,
        create_time: db.serverDate()
      }
    ]

    const activityResults = []
    for (const activity of activities) {
      const res = await db.collection('activities').add({ data: activity })
      activityResults.push({ id: res._id, ...activity })
    }

    // 4. 创建待审核的志愿者申请
    const applications = [
      {
        user_id: userResults[1].id,
        user_name: '李四',
        user_phone: '13900000002',
        club_id: clubResults[0].id,
        apply_time: db.serverDate(),
        status: 'pending'
      }
    ]

    const applicationResults = []
    for (const app of applications) {
      const res = await db.collection('volunteer_applications').add({ data: app })
      applicationResults.push({ id: res._id, ...app })
    }

    return {
      success: true,
      data: {
        clubs: clubResults.length,
        users: userResults.length,
        activities: activityResults.length,
        applications: applicationResults.length,
        ids: {
          clubs: clubResults.map(c => c.id),
          users: userResults.map(u => u.id),
          activities: activityResults.map(a => a.id),
          applications: applicationResults.map(a => a.id)
        }
      }
    }
  } catch (error) {
    console.error('seedData error:', error)
    return { success: false, error: error.message }
  }
}
