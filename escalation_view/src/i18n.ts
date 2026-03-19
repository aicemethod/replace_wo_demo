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
    headerType: 'タイトル',
    headerCreated: 'メモ',
    headerSync: '保存日時',
    placeholderFilename: 'ファイル名',
    placeholderTitle: 'タイトル',
    placeholderNote: 'メモ',
    attach: '添付',
    mobileType: 'タイトル',
    mobileCreated: 'メモ',
    mobileSync: '保存日時'
  },
  en: {
    add: 'Add',
    save: 'Save File',
    refresh: 'Refresh List',
    cancel: 'Cancel',
    loading: 'Loading...',
    noData: 'No data available',
    headerFilename: 'File Name',
    headerType: 'Title',
    headerCreated: 'Note',
    headerSync: 'Saved Date and Time',
    placeholderFilename: 'File name',
    placeholderTitle: 'Title',
    placeholderNote: 'Note',
    attach: 'Attach',
    mobileType: 'Title',
    mobileCreated: 'Note',
    mobileSync: 'Saved Date and Time'
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
