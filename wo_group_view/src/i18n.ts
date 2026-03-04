export type AppLocale = 'ja' | 'en'

const JA_LCID = 1041

const messages = {
  ja: {
    workTableTitle: 'WOグループ候補リスト',
    bindGroup: 'WOグループ化',
    unbindGroup: 'グループ解除',
    sameGroupTitle: '同一グループのWO',
    currentGroupTitle: 'このWOが所属するWOグループ',
    sortAsc: '昇順',
    sortDesc: '降順',
    filter: 'フィルター',
    apply: '適用',
    rows: '行',
    selectAll: 'すべて選択',
    selectRow: '行を選択',
    horizontalScroll: '横スクロール',
    close: '閉じる',
    column_groupNumber: 'WOグループ番号',
    column_groupTitle: 'WOグループタイトル',
    column_woNumber: 'WO番号',
    column_woTitle: 'WOタイトル',
    column_endUser: 'End User',
    column_bu: 'BU',
    column_woType: 'WO Type',
    column_equipmentSn: '装置S/N',
    column_woStatus: 'WOステータス',
    column_calcStatus: '計算ステータス',
    column_customerPoNo: 'Customer PO No.',
    column_customerPoNoText: 'Customer PO No.(テキスト)',
    column_soNo: 'SO No.',
    column_soNoText: 'SO No.(Text)',
    column_primarySo: 'Primary SO',
    column_status: 'ステータス',
    op_equals: '次の値と等しい',
    op_notEquals: '次と等しくない',
    op_isSet: '値が設定済',
    op_isEmpty: 'データが含まれていません',
    op_contains: '次を含む',
    op_notContains: '次を含まない',
    op_startsWith: '次で始まる',
    op_notStartsWith: '次で始まらない',
    op_endsWith: '次で終わる',
    op_notEndsWith: '次で終わらない',
  },
  en: {
    workTableTitle: 'Work Orders Available for Grouping',
    bindGroup: 'Group the selected WOs',
    unbindGroup: 'Remove from This Group',
    sameGroupTitle: 'WO Grouping Candidates',
    currentGroupTitle: 'Parent WO Group',
    sortAsc: 'Sort Ascending',
    sortDesc: 'Sort Descending',
    filter: 'Filter',
    apply: 'Apply',
    rows: 'Rows',
    selectAll: 'Select all',
    selectRow: 'Select row',
    horizontalScroll: 'Horizontal scroll',
    close: 'Close',
    column_groupNumber: 'WO Group No.',
    column_groupTitle: 'WO Group Title',
    column_woNumber: 'WO No.',
    column_woTitle: 'WO Title',
    column_endUser: 'End User',
    column_bu: 'BU',
    column_woType: 'WO Type',
    column_equipmentSn: 'Target customer machine',
    column_woStatus: 'WO Status',
    column_calcStatus: 'Calculation Status',
    column_customerPoNo: 'Customer PO No.',
    column_customerPoNoText: 'Customer PO No. (Text)',
    column_soNo: 'SO No.',
    column_soNoText: 'SO No. (Text)',
    column_primarySo: 'Primary SO',
    column_status: 'Status',
    op_equals: 'Equals',
    op_notEquals: 'Does not equal',
    op_isSet: 'Has data',
    op_isEmpty: 'Does not contain data',
    op_contains: 'Contains',
    op_notContains: 'Does not contain',
    op_startsWith: 'Starts with',
    op_notStartsWith: 'Does not start with',
    op_endsWith: 'Ends with',
    op_notEndsWith: 'Does not end with',
  },
} as const

export const getAppLocaleFromXrm = (): AppLocale => {
  try {
    const xrm = (window as any)?.parent?.Xrm ?? (window as any)?.Xrm
    const languageId = xrm?.Utility?.getGlobalContext?.()?.userSettings?.languageId
    return languageId === JA_LCID ? 'ja' : 'en'
  } catch {
    return 'ja'
  }
}

export const getMessages = (locale: AppLocale) => messages[locale]

