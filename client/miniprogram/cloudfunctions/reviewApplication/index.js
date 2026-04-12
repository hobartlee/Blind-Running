const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { applicationId, action, clubId } = event
  // action: 'approve' | 'reject'

  try {
    const app = db.collection('volunteer_applications').doc(applicationId)

    if (action === 'approve') {
      // 获取申请信息
      const appRes = await app.get()
      if (!appRes.data) {
        return { success: false, error: '申请不存在' }
      }

      // 更新用户表，关联跑团
      await db.collection('users').doc(appRes.data.user_id).update({
        data: {
          club_id: clubId,
          club_name: ''
        }
      })

      // 更新申请状态
      await app.update({
        data: { status: 'approved' }
      })

      // 更新跑团人数
      const club = await db.collection('clubs').doc(clubId).get()
      if (club.data) {
        await db.collection('clubs').doc(clubId).update({
          data: {
            member_count: (club.data.member_count || 0) + 1
          }
        })
      }
    } else if (action === 'reject') {
      await app.update({
        data: { status: 'rejected' }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('reviewApplication error:', error)
    return { success: false, error: error.message }
  }
}
