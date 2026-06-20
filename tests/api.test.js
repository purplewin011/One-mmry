import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const rootDir = 'd:/个人项目/OneMmry'
const serverPath = join(rootDir, 'backend', 'server.js')

async function startServer() {
  const tempDir = await mkdtemp(join(tmpdir(), 'onemmry-api-'))
  const dbFile = join(tempDir, 'db.json')
  await writeFile(dbFile, JSON.stringify({ diaries: [], albums: [], videos: [] }, null, 2), 'utf8')

  const child = spawn(process.execPath, [serverPath], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: '0',
      DB_FILE: dbFile,
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let resolved = false
  const port = await new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const text = chunk.toString('utf8')
      const match = text.match(/http:\/\/localhost:(\d+)/)
      if (match && !resolved) {
        resolved = true
        resolve(Number(match[1]))
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', (chunk) => {
      if (!resolved) {
        const text = chunk.toString('utf8')
        reject(new Error(text))
      }
    })
    child.once('error', reject)
    child.once('exit', (code) => {
      if (!resolved) reject(new Error(`server exited early with code ${code}`))
    })
  })

  return {
    child,
    port,
    dbFile,
    cleanup: async () => {
      child.kill()
      await rm(tempDir, { recursive: true, force: true })
    },
  }
}

test('GET /api/all returns initialized data', async () => {
  const server = await startServer()
  try {
    const response = await fetch(`http://127.0.0.1:${server.port}/api/all`) 
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.deepEqual(body, { diaries: [], albums: [], videos: [] })
  } finally {
    await server.cleanup()
  }
})

test('POST /api/sync persists payload and subsequent GET reads it back', async () => {
  const server = await startServer()
  const payload = {
    diaries: [{ id: 1, title: '第一篇日记', color: '#607d8b', pages: ['今天完成了测试。'] }],
    albums: [{ id: 2, title: '春日相册', color: '#795548', photos: [] }],
    videos: [{ id: 3, title: '毕业录像', color: '#1a237e', url: 'blob:test' }],
  }

  try {
    const syncResponse = await fetch(`http://127.0.0.1:${server.port}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    assert.equal(syncResponse.status, 200)

    const getResponse = await fetch(`http://127.0.0.1:${server.port}/api/all`)
    assert.equal(getResponse.status, 200)
    const body = await getResponse.json()
    assert.deepEqual(body, payload)

    const fileContent = JSON.parse(await readFile(server.dbFile, 'utf8'))
    assert.deepEqual(fileContent, payload)
  } finally {
    await server.cleanup()
  }
})
