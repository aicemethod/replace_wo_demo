export type SectionKey = 'group' | 'main' | 'same'

export const getSectionFromParam = (search: string): SectionKey | null => {
  const params = new URLSearchParams(search)
  const value = params.get('section')
  if (value === 'group' || value === 'main' || value === 'same') {
    return value
  }
  return null
}
