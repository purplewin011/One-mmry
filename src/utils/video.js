export const calculateVideoProgress = (currentTime, duration) => {
  if (!duration || duration <= 0) return 0
  return (currentTime / duration) * 100
}

export const togglePlaybackFlag = (isPlaying) => {
  return !isPlaying
}

export const toggleMuteFlag = (isMuted) => {
  return !isMuted
}
