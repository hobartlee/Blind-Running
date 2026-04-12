const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { phone, userType, name, gender, age, experience, clubId, clubName } = event

  if (!phone) {
    return { success: false, error: '缺少手机号' }
  }

  try {
    const res = await db.collection('users').where({
      phone,
      user_type: userType
    }).get()

    if (res.data && res.data.length > 0) {
      const userId = res.data[0]._id
      const updateData = {}
      if (name !== undefined) updateData.name = name
      if (gender !== undefined) updateData.gender = gender
      if (age !== undefined) updateData.age = age
      if (experience !== undefined) updateData.experience = experience
      if (clubId !== undefined) updateData.club_id = clubId
      if (clubName !== undefined) updateData.club_name = clubName

      await db.collection('users').doc(userId).update({ data: updateData })
    }

    return { success: true }
  } catch (error) {
    console.error('updateUser error:', error)
    return { success: false, error: error.message }
  }
}
