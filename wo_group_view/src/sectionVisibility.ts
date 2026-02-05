export type SectionKey = 'group' | 'main' | 'same'

const isSectionKey = (value: unknown): value is SectionKey =>
  value === 'group' || value === 'main' || value === 'same'

export const getSectionFromParam = (search: string): SectionKey | null => {
  const params = new URLSearchParams(search)
  const data = params.get('data')
  console.log('[section] search', search)
  console.log('[section] data', data)
  if (!data) return null

  try {
    const parsed = JSON.parse(data) as { value?: unknown }
    console.log('[section] parsed', parsed)
    if (isSectionKey(parsed.value)) {
      console.log('[section] resolved', parsed.value)
      return parsed.value
    }
  } catch {
    console.log('[section] parse failed')
    return null
  }

  return null
}
