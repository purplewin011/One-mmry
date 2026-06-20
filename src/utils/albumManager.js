export const addPhotoToAlbum = (album, photo) => {
  const newPhoto = {
    id: Date.now(),
    url: photo.url,
    page: photo.page ?? 1,
    x: photo.x ?? 50,
    y: photo.y ?? 50,
    rotate: photo.rotate ?? 0,
  }

  return { ...album, photos: [...(album.photos || []), newPhoto] }
}

export const removePhotoById = (album, photoId) => {
  return { ...album, photos: (album.photos || []).filter(p => p.id !== photoId) }
}
