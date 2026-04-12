const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, name, location, description } = event

  if (!phone || !name) {
    return { success: false, error: '缺少必填参数' }
  }

  try {
    // 检查是否已存在
    const existing = await db.collection('clubs').where({ phone }).get()

    let club
    if (existing.data && existing.data.length > 0) {
      // 更新
      await db.collection('clubs').doc(existing.data[0]._id).update({
        data: { name, location, description }
      })
      club = { ...existing.data[0], name, location, description }
    } else {
      // 创建
      const addRes = await db.collection('clubs').add({
        data: {
          phone,
          name,
          location: location || '',
          description: description || '',
          member_count: 0,
          total_activities: 0,
          total_helped: 0,
          create_time: db.serverDate()
        }
      })
      club = {
        _id: addRes._id,
        phone,
        name,
        location: location || '',
        description: description || '',
        member_count: 0,
        total_activities: 0,
        total_helped: 0
      }
    }

    return {
      success: true,
      data: {
        id: club._id,
        phone: club.phone,
        name: club.name,
        location: club.location,
        description: club.description,
        member_count: club.member_count,
        total_activities: club.total_activities,
        total_helped: club.total_helped
      }
    }
  } catch (error) {
    console.error('saveClub error:', error)
    return { success: false, error: error.message }
  }
}
