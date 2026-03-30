export type AppLocale = 'ja' | 'en';

const JA_LCID = 1041;

const messages = {
  ja: {
    tableTitle: '添付ファイル一覧',
    add: '追加',
    save: '保存',
    saveFile: 'ファイルを保存',
    fileLink: 'xECMに連携',
    refresh: '更新',
    cancel: 'キャンセル',
    delete: '削除',
    loading: '読み込み中...',
    noData: 'データがありません',
    headerTarget: 'xECM連携対象',
    headerFilename: 'ファイル名',
    headerType: 'ファイル種別',
    headerCreated: '保存日時',
    headerSync: 'xECM実行連携日時',
    headerTccSync: 'TCC連携実行日',
    placeholderFilename: 'ファイル名',
    attach: '添付',
    ariaDeleteDisabled: '削除選択不可',
    ariaSelectDisabled: '選択不可',
    ariaDeleteSelect: '削除選択',
    ariaDeleteUnselect: '削除選択解除',
    ariaSelect: '選択',
    ariaUnselect: '選択解除',
    mobileType: 'ファイル種別',
    mobileCreated: '保存日時',
    mobileSync: 'xECM実行連携日時',
    fileTypeTechnicalAcceptance: '技術検収書(Technical Acceptance)',
    fileTypeOther: 'Other'
  },
  en: {
    tableTitle: 'Attachment List',
    add: 'Add',
    save: 'Submit',
    saveFile: 'Save File',
    fileLink: 'Submit to xECM',
    refresh: 'Refresh List',
    cancel: 'Cancel',
    delete: 'Delete',
    loading: 'Loading...',
    noData: 'No data available',
    headerTarget: 'xECM Integration target',
    headerFilename: 'File Name',
    headerType: 'File Type',
    headerCreated: 'Saved Date and Time',
    headerSync: 'xECM Integration Date',
    headerTccSync: 'TCC Integration Date',
    placeholderFilename: 'File name',
    attach: 'Attach',
    ariaDeleteDisabled: 'Delete selection disabled',
    ariaSelectDisabled: 'Selection disabled',
    ariaDeleteSelect: 'Select for deletion',
    ariaDeleteUnselect: 'Unselect for deletion',
    ariaSelect: 'Select',
    ariaUnselect: 'Unselect',
    mobileType: 'File Type',
    mobileCreated: 'Saved At',
    mobileSync: 'SxECM ync Date',
    fileTypeTechnicalAcceptance: 'Technical Acceptance',
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
