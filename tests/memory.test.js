import test from 'node:test'
import assert from 'node:assert/strict'
import { createAlbumRecord, createDiaryRecord, createVideoRecord, getRandomColor } from '../src/utils/memory.js'

test('getRandomColor returns a palette value', () => {
  const color = getRandomColor(() => 0)
  assert.equal(color, '#607d8b')
})

test('createDiaryRecord builds diary page structure', () => {
  const diary = createDiaryRecord('测试日记', () => 0.2)
  assert.equal(diary.title, '测试日记')
  assert.equal(diary.pages.length, 11)
  assert.deepEqual(diary.pages, Array(11).fill(''))
  assert.ok(diary.color)
})

test('createAlbumRecord builds empty photo container', () => {
  const album = createAlbumRecord('测试相册', () => 0.4)
  assert.equal(album.title, '测试相册')
  assert.deepEqual(album.photos, [])
  assert.ok(album.color)
})

test('createVideoRecord keeps title and url', () => {
  const video = createVideoRecord('测试录像带', 'blob:test', () => 0.8)
  assert.equal(video.title, '测试录像带')
  assert.equal(video.url, 'blob:test')
  assert.ok(video.color)
})
