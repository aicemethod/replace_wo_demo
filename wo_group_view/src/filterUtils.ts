import { getMessages, type AppLocale } from './i18n'

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

const filterOperatorKeys: FilterOperatorKey[] = [
  'equals',
  'notEquals',
  'isSet',
  'isEmpty',
  'contains',
  'notContains',
  'startsWith',
  'notStartsWith',
  'endsWith',
  'notEndsWith',
]

export const getFilterOperatorLabel = (key: FilterOperatorKey, locale: AppLocale = 'ja') => {
  const msg = getMessages(locale)
  const labels: Record<FilterOperatorKey, string> = {
    equals: msg.op_equals,
    notEquals: msg.op_notEquals,
    isSet: msg.op_isSet,
    isEmpty: msg.op_isEmpty,
    contains: msg.op_contains,
    notContains: msg.op_notContains,
    startsWith: msg.op_startsWith,
    notStartsWith: msg.op_notStartsWith,
    endsWith: msg.op_endsWith,
    notEndsWith: msg.op_notEndsWith,
  }
  return labels[key] ?? msg.op_equals
}

export const getFilterOperatorOptions = (locale: AppLocale = 'ja') =>
  filterOperatorKeys.map((key) => ({
    key,
    label: getFilterOperatorLabel(key, locale),
  }))

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
