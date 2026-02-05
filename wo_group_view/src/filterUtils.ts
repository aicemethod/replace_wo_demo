export type FilterOperatorKey =
  | 'equals'
  | 'notEquals'
  | 'isSet'
  | 'isEmpty'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'notStartsWith'
  | 'endsWith'
  | 'notEndsWith'

export const filterOperatorOptions: { key: FilterOperatorKey; label: string }[] = [
  { key: 'equals', label: '次の値と等しい' },
  { key: 'notEquals', label: '次と等しくない' },
  { key: 'isSet', label: '値が設定済' },
  { key: 'isEmpty', label: 'データが含まれていません' },
  { key: 'contains', label: '次を含む' },
  { key: 'notContains', label: '次を含まない' },
  { key: 'startsWith', label: '次で始まる' },
  { key: 'notStartsWith', label: '次で始まらない' },
  { key: 'endsWith', label: '次で終わる' },
  { key: 'notEndsWith', label: '次で終わらない' },
]

export const getFilterOperatorLabel = (key: FilterOperatorKey) =>
  filterOperatorOptions.find((option) => option.key === key)?.label ?? '次の値と等しい'

export const operatorNeedsValue = (key: FilterOperatorKey) =>
  !['isSet', 'isEmpty'].includes(key)

const matchesOperator = (value: string, operator: FilterOperatorKey, input: string) => {
  switch (operator) {
    case 'equals':
      return value === input
    case 'notEquals':
      return value !== input
    case 'contains':
      return value.includes(input)
    case 'notContains':
      return !value.includes(input)
    case 'startsWith':
      return value.startsWith(input)
    case 'notStartsWith':
      return !value.startsWith(input)
    case 'endsWith':
      return value.endsWith(input)
    case 'notEndsWith':
      return !value.endsWith(input)
    case 'isSet':
      return value.length > 0
    case 'isEmpty':
      return value.length === 0
    default:
      return value.includes(input)
  }
}

export const filterRows = <T>(
  rows: T[],
  keys: (keyof T)[],
  operator: FilterOperatorKey,
  input: string
) => {
  const value = input ?? ''
  return rows.filter((row) =>
    keys.some((key) => matchesOperator(String(row[key] ?? ''), operator, value))
  )
}
