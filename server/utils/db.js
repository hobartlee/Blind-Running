const mysql = require('mysql2/promise')

// 数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'VxJ2atjQ',
  database: 'bubu'
}

// 创建连接池
let pool = null

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool.getConnection()
}

// 初始化数据库
async function initDatabase() {
  try {
    // 先连接不带数据库，创建数据库
    const tempConfig = { ...dbConfig, database: undefined }
    const tempPool = mysql.createPool(tempConfig)

    // 创建数据库
    await tempPool.execute('CREATE DATABASE IF NOT EXISTS bubu')
    await tempPool.end()

    // 重新连接带数据库的
    pool = mysql.createPool(dbConfig)

    // 创建用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        user_type ENUM('blind', 'volunteer', 'group') NOT NULL,
        name VARCHAR(50) DEFAULT '',
        gender ENUM('male', 'female') DEFAULT NULL,
        age INT DEFAULT NULL,
        experience ENUM('none', 'beginner', 'intermediate', 'experienced') DEFAULT NULL,
        cert_status ENUM('verified', 'pending', 'unverified') DEFAULT 'unverified',
        club_id INT DEFAULT NULL,
        club_name VARCHAR(100) DEFAULT '',
        points INT DEFAULT 0,
        level VARCHAR(50) DEFAULT '初级志愿者',
        activity_count INT DEFAULT 0,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_user_type (user_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 创建跑团表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) DEFAULT '',
        description TEXT,
        contact_phone VARCHAR(20),
        member_count INT DEFAULT 0,
        total_activities INT DEFAULT 0,
        total_helped INT DEFAULT 0,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 创建活动表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT NOT NULL,
        club_name VARCHAR(100),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        date_time DATETIME,
        location VARCHAR(200),
        latitude DECIMAL(10, 6),
        longitude DECIMAL(10, 6),
        status ENUM('upcoming', 'ongoing', 'finished') DEFAULT 'upcoming',
        signup_count INT DEFAULT 0,
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_club_id (club_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    // 创建志愿者申请表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS volunteer_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(50),
        user_phone VARCHAR(20),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        apply_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_club_id (club_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database init error:', error)
  }
}

module.exports = { getConnection, initDatabase }
