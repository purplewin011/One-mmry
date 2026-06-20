import { join, dirname } from 'path'
import { pathToFileURL } from 'url'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// 初始化 Express
const app = express()
app.use(cors())
app.use(express.json())

// 初始化 lowdb
const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDbFile = join(__dirname, 'db.json')
const dbFile = process.env.DB_FILE || defaultDbFile
const adapter = new JSONFile(dbFile)
const db = new Low(adapter)

// 初始化数据库文件
await db.read()
db.data ||= { diaries: [], albums: [], videos: [] }
await db.write()

// --- API 路由 ---

// 获取所有数据
app.get('/api/all', async (req, res) => {
  await db.read()
  res.json(db.data)
})

// 更新所有数据 (简单粗暴的同步方式)
app.post('/api/sync', async (req, res) => {
  db.data = req.body
  await db.write()
  res.status(200).json({ message: '数据同步成功' })
})


// 启动服务器
const PORT = Number(process.env.PORT || 3000)
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  const server = app.listen(PORT, () => {
    const address = server.address()
    const actualPort = typeof address === 'object' && address ? address.port : PORT
    console.log(`后端服务器已启动，运行在 http://localhost:${actualPort}`)
  })
}

export { app, db }
