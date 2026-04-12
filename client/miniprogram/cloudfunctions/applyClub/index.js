const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId, clubId, userName, userPhone } = event

  try {
    // 检查是否已有待处理的申请
    const existing = await db.collection('volunteer_applications').where({
      user_id: userId,
      club_id: clubId,
      status: 'pending'
    }).get()

    if (existing.data && existing.data.length > 0) {
      return { success: false, error: '已有待处理的申请' }
    }

    await db.collection('volunteer_applications').add({
      data: {
        club_id: clubId,
        user_id: userId,
        user_name: userName || '',
        user_phone: userPhone || '',
        status: 'pending',
        apply_time: db.serverDate()
      }
    })

    return { success: true }
  } catch (error) {
    console.error('applyClub error:', error)
    return { success: false, error: error.message }
  }
}
