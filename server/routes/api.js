const express = require('express')
const router = express.Router()
const { getConnection } = require('../utils/db')
const { decodePhoneNumber } = require('../services/phoneService')

// 管理员手机号白名单
const ADMIN_PHONE = '17610275009'

// ============ 手机号解密 ============
router.post('/decodePhone', async (req, res) => {
  try {
    const { code, encryptedData, iv } = req.body

    if (!code) {
      return res.json({ success: false, error: '缺少code参数' })
    }

    // 用code换取session_key和openid
    const result = await decodePhoneNumber(code)

    res.json({
      success: true,
      data: {
        openid: result.openid,
        // 注意：真实项目中需要用 session_key 解密 encryptedData 获取手机号
        // 这里返回openid，前端可以用openid作为用户标识
        phone: result.openid ? `mock_phone_${result.openid.slice(0, 8)}` : null // 演示用mock
      }
    })
  } catch (error) {
    console.error('decodePhone error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 用户登录 ============
router.post('/login', async (req, res) => {
  try {
    const { phone, userType, openid } = req.body

    if (!phone) {
      return res.json({ success: false, error: '缺少手机号' })
    }

    const conn = await getConnection()

    // 查找或创建用户
    let [rows] = await conn.execute(
      'SELECT * FROM users WHERE phone = ? AND user_type = ?',
      [phone, userType]
    )

    let user
    if (rows.length === 0) {
      // 新用户
      const [insertResult] = await conn.execute(
        'INSERT INTO users (phone, user_type, openid) VALUES (?, ?, ?)',
        [phone, userType, openid || '']
      )
      user = { id: insertResult.insertId, phone, user_type: userType, isNew: true }
    } else {
      user = { ...rows[0], isNew: false }
    }

    // 更新最后登录时间
    await conn.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )

    conn.release()

    // 检查是否为管理员
    const isAdmin = phone === ADMIN_PHONE

    res.json({
      success: true,
      data: {
        ...user,
        isAdmin
      }
    })
  } catch (error) {
    console.error('login error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 更新用户信息 ============
router.post('/updateUser', async (req, res) => {
  try {
    const { phone, userType, name, gender, age, experience, clubId, clubName } = req.body

    if (!phone) {
      return res.json({ success: false, error: '缺少手机号' })
    }

    const conn = await getConnection()
    await conn.execute(
      `UPDATE users SET
        name = COALESCE(?, name),
        gender = COALESCE(?, gender),
        age = COALESCE(?, age),
        experience = COALESCE(?, experience),
        club_id = COALESCE(?, club_id),
        club_name = COALESCE(?, club_name)
      WHERE phone = ? AND user_type = ?`,
      [name, gender, age, experience, clubId, clubName, phone, userType]
    )

    conn.release()
    res.json({ success: true })
  } catch (error) {
    console.error('updateUser error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 获取用户列表 ============
router.get('/users', async (req, res) => {
  try {
    const { type } = req.query

    const conn = await getConnection()
    let sql = 'SELECT * FROM users'
    let params = []

    if (type) {
      sql += ' WHERE user_type = ?'
      params.push(type)
    }

    sql += ' ORDER BY create_time DESC'

    const [rows] = await conn.execute(sql, params)
    conn.release()

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('getUsers error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 创建/更新跑团 ============
router.post('/club', async (req, res) => {
  try {
    const { phone, name, location, description } = req.body

    if (!phone || !name) {
      return res.json({ success: false, error: '缺少必填参数' })
    }

    const conn = await getConnection()

    // 检查是否已存在
    const [existing] = await conn.execute(
      'SELECT * FROM clubs WHERE phone = ?',
      [phone]
    )

    let club
    if (existing.length > 0) {
      // 更新
      await conn.execute(
        'UPDATE clubs SET name = ?, location = ?, description = ? WHERE phone = ?',
        [name, location, description, phone]
      )
      club = { ...existing[0], name, location, description }
    } else {
      // 创建
      const [insertResult] = await conn.execute(
        'INSERT INTO clubs (phone, name, location, description, contact_phone) VALUES (?, ?, ?, ?, ?)',
        [phone, name, location, description, phone]
      )
      club = {
        id: insertResult.insertId,
        phone,
        name,
        location,
        description,
        contact_phone: phone,
        member_count: 0,
        total_activities: 0,
        total_helped: 0
      }
    }

    conn.release()
    res.json({ success: true, data: club })
  } catch (error) {
    console.error('club error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 获取跑团列表 ============
router.get('/clubs', async (req, res) => {
  try {
    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT c.*, (SELECT COUNT(*) FROM users WHERE club_id = c.id AND user_type = "volunteer") as member_count FROM clubs c ORDER BY create_time DESC'
    )
    conn.release()

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('getClubs error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 获取跑团详情 ============
router.get('/club', async (req, res) => {
  try {
    const { phone } = req.query

    if (!phone) {
      return res.json({ success: false, error: '缺少手机号' })
    }

    const conn = await getConnection()
    const [rows] = await conn.execute(
      'SELECT * FROM clubs WHERE phone = ?',
      [phone]
    )

    if (rows.length === 0) {
      conn.release()
      return res.json({ success: false, error: '跑团不存在' })
    }

    // 获取志愿者列表
    const [volunteers] = await conn.execute(
      'SELECT * FROM users WHERE club_id = ? AND user_type = "volunteer" ORDER BY create_time DESC',
      [rows[0].id]
    )

    // 获取待审核志愿者
    const [pending] = await conn.execute(
      'SELECT * FROM volunteer_applications WHERE club_id = ? AND status = "pending"',
      [rows[0].id]
    )

    conn.release()

    res.json({
      success: true,
      data: {
        ...rows[0],
        volunteers,
        pendingApplications: pending
      }
    })
  } catch (error) {
    console.error('getClub error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 志愿者申请加入跑团 ============
router.post('/applyClub', async (req, res) => {
  try {
    const { userId, clubId, userName, userPhone } = req.body

    const conn = await getConnection()

    // 检查是否已有申请
    const [existing] = await conn.execute(
      'SELECT * FROM volunteer_applications WHERE user_id = ? AND club_id = ? AND status = "pending"',
      [userId, clubId]
    )

    if (existing.length > 0) {
      conn.release()
      return res.json({ success: false, error: '已有待处理的申请' })
    }

    await conn.execute(
      'INSERT INTO volunteer_applications (user_id, club_id, user_name, user_phone) VALUES (?, ?, ?, ?)',
      [userId, clubId, userName, userPhone]
    )

    conn.release()
    res.json({ success: true })
  } catch (error) {
    console.error('applyClub error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 审核志愿者申请 ============
router.post('/reviewApplication', async (req, res) => {
  try {
    const { applicationId, action, clubId } = req.body
    // action: approve / reject

    const conn = await getConnection()

    if (action === 'approve') {
      // 获取申请信息
      const [apps] = await conn.execute(
        'SELECT * FROM volunteer_applications WHERE id = ?',
        [applicationId]
      )

      if (apps.length > 0) {
        const app = apps[0]

        // 更新用户表
        await conn.execute(
          'UPDATE users SET club_id = ? WHERE id = ?',
          [clubId, app.user_id]
        )

        // 更新申请状态
        await conn.execute(
          'UPDATE volunteer_applications SET status = "approved" WHERE id = ?',
          [applicationId]
        )

        // 更新跑团人数
        await conn.execute(
          'UPDATE clubs SET member_count = member_count + 1 WHERE id = ?',
          [clubId]
        )
      }
    } else if (action === 'reject') {
      await conn.execute(
        'UPDATE volunteer_applications SET status = "rejected" WHERE id = ?',
        [applicationId]
      )
    }

    conn.release()
    res.json({ success: true })
  } catch (error) {
    console.error('reviewApplication error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 创建活动 ============
router.post('/activity', async (req, res) => {
  try {
    const { clubId, clubName, title, description, dateTime, location, latitude, longitude } = req.body

    if (!clubId || !title) {
      return res.json({ success: false, error: '缺少必填参数' })
    }

    const conn = await getConnection()
    const [result] = await conn.execute(
      `INSERT INTO activities (club_id, club_name, title, description, date_time, location, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clubId, clubName, title, description, dateTime, location, latitude, longitude]
    )

    // 更新跑团活动数
    await conn.execute(
      'UPDATE clubs SET total_activities = total_activities + 1 WHERE id = ?',
      [clubId]
    )

    conn.release()
    res.json({ success: true, data: { id: result.insertId } })
  } catch (error) {
    console.error('createActivity error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 获取活动列表 ============
router.get('/activities', async (req, res) => {
  try {
    const { clubId, status } = req.query

    const conn = await getConnection()
    let sql = 'SELECT * FROM activities WHERE 1=1'
    let params = []

    if (clubId) {
      sql += ' AND club_id = ?'
      params.push(clubId)
    }

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ' ORDER BY date_time DESC'

    const [rows] = await conn.execute(sql, params)
    conn.release()

    res.json({ success: true, data: rows })
  } catch (error) {
    console.error('getActivities error:', error)
    res.json({ success: false, error: error.message })
  }
})

// ============ 管理员接口 ============
router.get('/admin/users', async (req, res) => {
  try {
    const { phone } = req.query

    // 验证管理员权限
    if (phone !== ADMIN_PHONE) {
      return res.json({ success: false, error: '无权限' })
    }

    const conn = await getConnection()

    // 获取各类用户统计
    const [blinds] = await conn.execute(
      "SELECT * FROM users WHERE user_type = 'blind' ORDER BY create_time DESC"
    )
    const [volunteers] = await conn.execute(
      "SELECT * FROM users WHERE user_type = 'volunteer' ORDER BY create_time DESC"
    )
    const [clubs] = await conn.execute(
      'SELECT * FROM clubs ORDER BY create_time DESC'
    )

    conn.release()

    res.json({
      success: true,
      data: {
        blinds,
        volunteers,
        clubs
      }
    })
  } catch (error) {
    console.error('admin error:', error)
    res.json({ success: false, error: error.message })
  }
})

module.exports = router
