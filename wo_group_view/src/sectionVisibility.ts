export type SectionKey = 'group' | 'main' | 'same'

const isSectionKey = (value: unknown): value is SectionKey =>
  value === 'group' || value === 'main' || value === 'same'

export const getSectionFromParam = (search: string): SectionKey | null => {
  const params = new URLSearchParams(search)
  const data = params.get('data')
  if (!data) return null

  try {
    const parsed = JSON.parse(data) as { value?: unknown }
    if (isSectionKey(parsed.value)) {
      return parsed.value
    }
  } catch {
    return null
  }

  return null
}
