import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateVideoProgress, toggleMuteFlag, togglePlaybackFlag } from '../src/utils/video.js'

test('calculateVideoProgress handles valid durations', () => {
  assert.equal(calculateVideoProgress(25, 100), 25)
  assert.equal(calculateVideoProgress(0, 100), 0)
})

test('calculateVideoProgress returns zero for invalid duration', () => {
  assert.equal(calculateVideoProgress(10, 0), 0)
  assert.equal(calculateVideoProgress(10, undefined), 0)
})

test('togglePlaybackFlag and toggleMuteFlag invert state', () => {
  assert.equal(togglePlaybackFlag(true), false)
  assert.equal(togglePlaybackFlag(false), true)
  assert.equal(toggleMuteFlag(true), false)
  assert.equal(toggleMuteFlag(false), true)
})
