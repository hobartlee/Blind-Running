const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { clubId, clubName, title, description, dateTime, location, latitude, longitude } = event

  if (!clubId || !title) {
    return { success: false, error: '缺少必填参数' }
  }

  try {
    const addRes = await db.collection('activities').add({
      data: {
        club_id: clubId,
        club_name: clubName || '',
        title,
        description: description || '',
        date_time: dateTime || '',
        location: location || '',
        latitude: latitude || null,
        longitude: longitude || null,
        status: 'upcoming',
        signup_count: 0,
        signupCount: 0,
        create_time: db.serverDate()
      }
    })

    // 更新跑团活动数
    const club = await db.collection('clubs').doc(clubId).get()
    if (club.data) {
      await db.collection('clubs').doc(clubId).update({
        data: {
          total_activities: (club.data.total_activities || 0) + 1
        }
      })
    }

    return { success: true, data: { id: addRes._id } }
  } catch (error) {
    console.error('createActivity error:', error)
    return { success: false, error: error.message }
  }
}
