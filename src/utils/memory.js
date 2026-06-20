const MEMORY_COLORS = ['#607d8b', '#795548', '#880e4f', '#1a237e', '#1b5e20']

export const getRandomColor = (randomFn = Math.random) => {
  return MEMORY_COLORS[Math.floor(randomFn() * MEMORY_COLORS.length)]
}

export const createDiaryRecord = (title, randomFn = Math.random) => ({
  id: Date.now(),
  title,
  color: getRandomColor(randomFn),
  pages: Array(11).fill(''),
})

export const createAlbumRecord = (title, randomFn = Math.random) => ({
  id: Date.now(),
  title,
  color: getRandomColor(randomFn),
  photos: [],
})

export const createVideoRecord = (title, url, randomFn = Math.random) => ({
  id: Date.now(),
  title,
  color: getRandomColor(randomFn),
  url,
})
