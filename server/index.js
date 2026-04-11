const express = require('express')
const cors = require('cors')
const apiRouter = require('./routes/api')

const app = express()

// 初始化数据库
const { initDatabase } = require('./utils/db')
initDatabase()

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api', apiRouter)

// 健康检查
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: '步步有伴 API' })
})

// 端口
const PORT = process.env.PORT || 80
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
