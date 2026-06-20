export const createAlbumItem = (title, url) => ({
  id: Date.now(),
  title,
  url,
  createTime: new Date().toISOString(),
})

export const filterValidImages = (list) => {
  return list.filter(item => item.url && item.url.trim() !== '')
}