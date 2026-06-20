import test from 'node:test'
import assert from 'node:assert/strict'
import { DIARY_PAGE_COUNT, flipDiaryPage, getDiaryPageLabel, normalizeDiaryPages } from '../src/utils/diary.js'

test('normalizeDiaryPages pads diary pages to 11 entries', () => {
  const pages = normalizeDiaryPages(['第一页', '第二页'])
  assert.equal(pages.length, DIARY_PAGE_COUNT)
  assert.equal(pages[0], '第一页')
  assert.equal(pages[1], '第二页')
  assert.equal(pages[2], '')
})

test('getDiaryPageLabel returns odd and even labels', () => {
  assert.equal(getDiaryPageLabel(1, 'front'), 1)
  assert.equal(getDiaryPageLabel(1, 'back'), 2)
  assert.equal(getDiaryPageLabel(6, 'front'), 11)
})

test('flipDiaryPage follows forward and backward page rules', () => {
  assert.equal(flipDiaryPage(0, 1), 1)
  assert.equal(flipDiaryPage(2, 2), 1)
  assert.equal(flipDiaryPage(3, 5), 5)
})
