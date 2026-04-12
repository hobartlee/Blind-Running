const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { type } = event

  try {
    let query = db.collection('users')
    if (type) {
      query = query.where({ user_type: type })
    }
    const res = await query.orderBy('create_time', 'desc').get()

    return {
      success: true,
      data: (res.data || []).map(u => ({
        id: u._id,
        phone: u.phone,
        user_type: u.user_type,
        name: u.name,
        gender: u.gender,
        age: u.age,
        experience: u.experience,
        club_id: u.club_id,
        club_name: u.club_name,
        cert_status: u.cert_status,
        create_time: u.create_time
      }))
    }
  } catch (error) {
    console.error('getUsers error:', error)
    return { success: false, error: error.message }
  }
}
