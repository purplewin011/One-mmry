import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises'
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

test('POST /api/sync persists album with photos and GET /api/all returns it', async () => {
  const server = await startServer()

  const payload = {
    diaries: [],
    albums: [
      {
        id: 10,
        title: '相册测试',
        color: '#795548',
        photos: [
          { id: 101, url: 'img1.jpg', page: 1, x: 10, y: 20, rotate: 0 },
          { id: 102, url: 'img2.jpg', page: 2, x: 30, y: 40, rotate: -5 },
        ],
      },
    ],
    videos: [],
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

test('Adding a photo via sync updates the albums array', async () => {
  const server = await startServer()

  try {
    // initial sync with empty albums
    const initial = { diaries: [], albums: [], videos: [] }
    await fetch(`http://127.0.0.1:${server.port}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initial),
    })

    // add new album with one photo
    const updated = {
      diaries: [],
      albums: [ { id: 20, title: '新增相册', color: '#1b5e20', photos: [ { id: 201, url: 'new.jpg', page: 1, x:50, y:50, rotate:2 } ] } ],
      videos: [],
    }

    const syncResp2 = await fetch(`http://127.0.0.1:${server.port}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    assert.equal(syncResp2.status, 200)

    const getResp2 = await fetch(`http://127.0.0.1:${server.port}/api/all`)
    const body2 = await getResp2.json()
    assert.deepEqual(body2, updated)
  } finally {
    await server.cleanup()
  }
})
