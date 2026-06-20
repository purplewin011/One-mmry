import test from 'node:test'
import assert from 'node:assert/strict'
import { createAlbumItem, filterValidImages } from '../src/utils/album.js'

test('UT-2.4-01 createAlbumItem returns album item object', () => {
  const item = createAlbumItem('测试照片', 'a.jpg')

  assert.equal(item.title, '测试照片')
  assert.equal(item.url, 'a.jpg')
  assert.equal(typeof item.id, 'number')
  assert.match(item.createTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
})

test('UT-2.4-02 filterValidImages keeps only valid image urls', () => {
  const input = [
    { url: 'a.jpg' },
    { url: '' },
    { url: '   ' },
    { url: 'b.png' },
    { url: null },
  ]

  const output = filterValidImages(input)

  assert.deepEqual(output, [{ url: 'a.jpg' }, { url: 'b.png' }])
})