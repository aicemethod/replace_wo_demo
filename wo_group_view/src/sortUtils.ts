export type SortDirection = 'asc' | 'desc'

const normalize = (value: unknown) => `${value ?? ''}`.trim()

export const sortRows = <T, K extends string>(
  rows: T[],
  keyMap: Record<K, keyof T>,
  key: K,
  direction: SortDirection
) => {
  const mappedKey = keyMap[key]
  const factor = direction === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const left = normalize((a as T)[mappedKey])
    const right = normalize((b as T)[mappedKey])

    if (!left && !right) return 0
    if (!left) return 1 * factor
    if (!right) return -1 * factor

    return left.localeCompare(right, 'ja') * factor
  })
}
