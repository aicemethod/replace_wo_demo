export type AppLocale = 'ja' | 'en';

const JA_LCID = 1041;

const messages = {
  ja: {
    add: '追加',
    save: '保存',
    refresh: '更新',
    cancel: 'キャンセル',
    loading: '読み込み中...',
    noData: 'データがありません',
    headerFilename: 'ファイル名',
    headerType: 'ファイル種別',
    headerCreated: '保存日時',
    headerSync: '連携実行日',
    placeholderFilename: 'ファイル名',
    attach: '添付',
    mobileType: 'ファイル種別',
    mobileCreated: '保存日時',
    mobileSync: '連携実行日',
    fileTypePassdown: 'Passdown/Daily Report',
    fileTypePpacYkm: 'PPAC/YKM',
    fileTypeTechnicalDocument: 'Technical Document',
    fileTypeOther: 'Other'
  },
  en: {
    add: 'Add',
    save: 'Submit',
    refresh: 'Refresh List',
    cancel: 'Cancel',
    loading: 'Loading...',
    noData: 'No data available',
    headerFilename: 'File Name',
    headerType: 'File Type',
    headerCreated: 'Saved Date and Time',
    headerSync: 'Integration Date',
    placeholderFilename: 'File name',
    attach: 'Attach',
    mobileType: 'File Type',
    mobileCreated: 'Saved At',
    mobileSync: 'Sync Date',
    fileTypePassdown: 'Passdown/Daily Report',
    fileTypePpacYkm: 'PPAC/YKM',
    fileTypeTechnicalDocument: 'Technical Document',
    fileTypeOther: 'Other'
  }
} as const;

export function getAppLocaleFromXrm(): AppLocale {
  try {
    if (typeof window === 'undefined') {
      return 'ja';
    }

    const xrm = (window.parent as any)?.Xrm;
    const languageId = xrm?.Utility?.getGlobalContext?.()?.userSettings?.languageId;
    return languageId === JA_LCID ? 'ja' : 'en';
  } catch (error) {
    console.warn('Failed to get user language from Xrm. Fallback to Japanese.', error);
    return 'ja';
  }
}

export function getMessages(locale: AppLocale) {
  return messages[locale];
}
