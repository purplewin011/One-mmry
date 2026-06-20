import test from 'node:test'
import assert from 'node:assert/strict'
import { addPhotoToAlbum, removePhotoById } from '../src/utils/albumManager.js'

test('UT-2.5-01 addPhotoToAlbum appends a new photo and does not mutate original', () => {
  const album = { id: 1, title: '相册', photos: [] }
  const newAlbum = addPhotoToAlbum(album, { url: 'a.jpg' })

  assert.equal(newAlbum.photos.length, 1)
  const p = newAlbum.photos[0]
  assert.equal(p.url, 'a.jpg')
  assert.equal(typeof p.id, 'number')
  assert.equal(p.page, 1)
  // 原始 album 不应被修改
  assert.deepEqual(album.photos, [])
})

test('UT-2.5-02 removePhotoById removes only the matching photo and preserves others', () => {
  const p1 = { id: 101, url: 'a.jpg' }
  const p2 = { id: 202, url: 'b.jpg' }
  const album = { id: 2, title: '相册2', photos: [p1, p2] }

  const res = removePhotoById(album, 101)

  assert.equal(res.photos.length, 1)
  assert.deepEqual(res.photos, [p2])
  // 原始 album 保持不变
  assert.equal(album.photos.length, 2)
})
