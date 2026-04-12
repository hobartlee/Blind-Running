const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const ADMIN_PHONE = '17610275009'

exports.main = async (event, context) => {
  const { phone } = event

  if (phone !== ADMIN_PHONE) {
    return { success: false, error: '无权限' }
  }

  try {
    const [blinds, volunteers, clubs] = await Promise.all([
      db.collection('users').where({ user_type: 'blind' }).orderBy('create_time', 'desc').get(),
      db.collection('users').where({ user_type: 'volunteer' }).orderBy('create_time', 'desc').get(),
      db.collection('clubs').orderBy('create_time', 'desc').get()
    ])

    return {
      success: true,
      data: {
        blinds: (blinds.data || []).map(u => ({
          id: u._id,
          phone: u.phone,
          name: u.name,
          gender: u.gender,
          age: u.age,
          experience: u.experience,
          cert_status: u.cert_status,
          create_time: u.create_time
        })),
        volunteers: (volunteers.data || []).map(u => ({
          id: u._id,
          phone: u.phone,
          name: u.name,
          gender: u.gender,
          experience: u.experience,
          club_id: u.club_id,
          club_name: u.club_name,
          create_time: u.create_time
        })),
        clubs: (clubs.data || []).map(c => ({
          id: c._id,
          phone: c.phone,
          name: c.name,
          location: c.location,
          member_count: c.member_count || 0,
          total_activities: c.total_activities || 0
        }))
      }
    }
  } catch (error) {
    console.error('adminGetUsers error:', error)
    return { success: false, error: error.message }
  }
}
