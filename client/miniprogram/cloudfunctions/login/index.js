// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const ADMIN_PHONE = '17610275009'

// 云函数入口函数
exports.main = async (event, context) => {
  const { phone, userType } = event

  if (!phone) {
    return { success: false, error: '缺少手机号' }
  }

  try {
    // 查找用户
    const res = await db.collection('users').where({
      phone,
      user_type: userType
    }).get()

    let user
    let isNew = false

    if (res.data && res.data.length > 0) {
      // 已存在用户，更新登录时间
      user = res.data[0]
      await db.collection('users').doc(user._id).update({
        data: {
          last_login: db.serverDate()
        }
      })
    } else {
      // 新建用户
      const addRes = await db.collection('users').add({
        data: {
          phone,
          user_type: userType,
          name: '',
          gender: '',
          age: null,
          experience: '',
          cert_status: 'unverified',
          club_id: null,
          club_name: '',
          points: 0,
          level: '初级志愿者',
          activity_count: 0,
          create_time: db.serverDate(),
          last_login: db.serverDate()
        }
      })
      user = { id: addRes._id, phone, user_type: userType, isNew: true }
      isNew = true
    }

    const isAdmin = phone === ADMIN_PHONE

    return {
      success: true,
      data: {
        id: user._id || user.id,
        phone: user.phone,
        user_type: user.user_type,
        name: user.name,
        gender: user.gender,
        age: user.age,
        experience: user.experience,
        club_id: user.club_id,
        club_name: user.club_name,
        isNew,
        isAdmin
      }
    }
  } catch (error) {
    console.error('login error:', error)
    return { success: false, error: error.message }
  }
}
