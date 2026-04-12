const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { clubId, status } = event

  try {
    let query = db.collection('activities')

    if (clubId) {
      query = query.where({ club_id: clubId })
    }

    const res = await query.orderBy('date_time', 'desc').get()

    let activities = res.data || []
    if (status) {
      activities = activities.filter(a => a.status === status)
    }

    return {
      success: true,
      data: activities.map(a => ({
        id: a._id,
        club_id: a.club_id,
        club_name: a.club_name,
        title: a.title,
        description: a.description,
        date_time: a.date_time,
        location: a.location,
        latitude: a.latitude,
        longitude: a.longitude,
        status: a.status,
        signup_count: a.signup_count || 0,
        signupCount: a.signup_count || 0
      }))
    }
  } catch (error) {
    console.error('getActivities error:', error)
    return { success: false, error: error.message }
  }
}
