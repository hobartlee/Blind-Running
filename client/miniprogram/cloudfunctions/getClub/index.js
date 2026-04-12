const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, id } = event

  try {
    let clubRes
    let club

    if (id) {
      // 按 _id 精确查询（doc 返回的不是数组）
      clubRes = await db.collection('clubs').doc(id).get()
      if (clubRes.data) {
        club = clubRes.data
      }
    }

    if (!club && phone) {
      // 按手机号查询（where 返回数组）
      clubRes = await db.collection('clubs').where({ phone }).get()
      if (clubRes.data && clubRes.data.length > 0) {
        club = clubRes.data[0]
      }
    }

    if (!club) {
      return { success: false, error: '跑团不存在' }
    }

    // 获取志愿者列表
    const volunteerRes = await db.collection('users').where({
      club_id: club._id,
      user_type: 'volunteer'
    }).orderBy('create_time', 'desc').get()

    // 获取待审核志愿者
    const pendingRes = await db.collection('volunteer_applications').where({
      club_id: club._id,
      status: 'pending'
    }).orderBy('apply_time', 'desc').get()

    // 获取俱乐部活动
    const activityRes = await db.collection('activities').where({
      club_id: club._id
    }).orderBy('date_time', 'desc').get()

    return {
      success: true,
      data: {
        id: club._id,
        phone: club.phone,
        name: club.name,
        location: club.location,
        description: club.description,
        member_count: club.member_count || 0,
        total_activities: club.total_activities || 0,
        total_helped: club.total_helped || 0,
        volunteers: (volunteerRes.data || []).map(v => ({
          id: v._id,
          phone: v.phone,
          name: v.name,
          gender: v.gender,
          experience: v.experience
        })),
        pendingApplications: (pendingRes.data || []).map(a => ({
          id: a._id,
          user_id: a.user_id,
          user_name: a.user_name,
          user_phone: a.user_phone,
          create_time: a.apply_time
        })),
        activities: (activityRes.data || []).map(a => ({
          id: a._id,
          title: a.title,
          description: a.description,
          date_time: a.date_time,
          location: a.location,
          status: a.status,
          signup_count: a.signup_count || 0,
          signupCount: a.signup_count || 0
        }))
      }
    }
  } catch (error) {
    console.error('getClub error:', error)
    return { success: false, error: error.message }
  }
}
