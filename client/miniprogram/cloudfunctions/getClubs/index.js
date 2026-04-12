const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const res = await db.collection('clubs').orderBy('create_time', 'desc').get()

    return {
      success: true,
      data: (res.data || []).map(c => ({
        id: c._id,
        phone: c.phone,
        name: c.name,
        location: c.location,
        description: c.description,
        member_count: c.member_count || 0,
        total_activities: c.total_activities || 0,
        total_helped: c.total_helped || 0
      }))
    }
  } catch (error) {
    console.error('getClubs error:', error)
    return { success: false, error: error.message }
  }
}
