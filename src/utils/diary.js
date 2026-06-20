export const DIARY_PAGE_COUNT = 11

export const normalizeDiaryPages = (pages = [], totalPages = DIARY_PAGE_COUNT) => {
  return Array.from({ length: totalPages }, (_, index) => pages[index] ?? '')
}

export const getDiaryPageLabel = (sheetIndex, side) => {
  return side === 'front' ? sheetIndex * 2 - 1 : sheetIndex * 2
}

export const flipDiaryPage = (currentPage, sheetIndex) => {
  return sheetIndex <= currentPage ? sheetIndex - 1 : sheetIndex
}
