const axios = require('axios')
const xml2js = require('xml2js')

// 微信接口配置
const WECHAT_CONFIG = {
  appid: process.env.WECHAT_APPID,
  secret: process.env.WECHAT_SECRET
}

// 解码手机号
async function decodePhoneNumber(code) {
  try {
    // 1. 用code换取session_key
    const sessionUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_CONFIG.appid}&js_code=${code}&grant_type=authorization_code`
    const sessionRes = await axios.get(sessionUrl)
    const { session_key, openid } = sessionRes.data

    if (!session_key) {
      throw new Error('Failed to get session_key')
    }

    // 注意：手机号解密需要 session_key 和 iv
    // 前端需要同时传递 encryptedData 和 iv
    // 这里返回 openid 作为标识，实际解密在前端完成（推荐做法）
    return { openid, session_key }
  } catch (error) {
    console.error('Phone decode error:', error)
    throw error
  }
}

// 简化的手机号获取（用于演示）
// 真实项目中，微信手机号授权后，前端会得到 encryptedData
// 需要后端用 session_key 和 iv 解密（参考微信官方解密流程）
async function getPhoneFromEncryptedData(encryptedData, iv, session_key) {
  const crypto = require('crypto')

  // base64解码
  const encryptedBuffer = Buffer.from(encryptedData, 'base64')
  const key = Buffer.from(session_key, 'base64')
  const ivBuffer = Buffer.from(iv, 'base64')

  // 解密
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuffer)
  let decrypted = decipher.update(encryptedBuffer)

  // PKCS7 解码
  const pad = decrypted[decrypted.length - 1]
  decrypted = decrypted.slice(0, decrypted.length - pad)

  const result = JSON.parse(decrypted.toString())
  return result.phoneNumber
}

module.exports = { decodePhoneNumber, getPhoneFromEncryptedData }
