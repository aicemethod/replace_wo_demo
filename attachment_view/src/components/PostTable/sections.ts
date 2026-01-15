/**
 * セクションごとの設定定義
 */

export interface SectionConfig {
  // セクション識別子
  sectionId: string
  // 表示用のタイトル
  displayTitle: string
  // Dataverseエンティティ名
  entityName: string
  // 新規作成時のステータスコード
  createStatusCode: number
  // 更新時のステータスコード
  updateStatusCode?: number
  // フィルタ条件（OData形式）
  filter?: string
  // 取得するフィールド
  selectFields: string[]
  // ソート順
  orderBy?: string
  // マッピング設定（Dataverseフィールド名 -> アプリ内フィールド名）
  fieldMapping: {
    id: string
    title: string
    content: string
    changeDate: string
    updateDate: string
    memoUser: string
    userName: string
    attachmentName: string
  }
}

/**
 * セクション設定のマップ
 */
export const SECTION_CONFIGS: Record<string, SectionConfig> = {
  A: {
    sectionId: 'A',
    displayTitle: 'Daily Report',
    entityName: 'cr123_memosectiona', // 実際のエンティティ名に置き換え
    createStatusCode: 1, // アクティブ
    updateStatusCode: 1,
    filter: 'statecode eq 0', // アクティブなレコードのみ
    selectFields: [
      'cr123_memosectionaid',
      'cr123_title',
      'cr123_content',
      'cr123_changedate',
      'cr123_updatedate',
      'cr123_memouser',
      'cr123_username',
      'cr123_attachmentname'
    ],
    orderBy: 'cr123_updatedate desc',
    fieldMapping: {
      id: 'cr123_memosectionaid',
      title: 'cr123_title',
      content: 'cr123_content',
      changeDate: 'cr123_changedate',
      updateDate: 'cr123_updatedate',
      memoUser: 'cr123_memouser',
      userName: 'cr123_username',
      attachmentName: 'cr123_attachmentname'
    }
  },
  B: {
    sectionId: 'B',
    displayTitle: 'TSR/TSR Summary',
    entityName: 'cr123_memosectionb',
    createStatusCode: 1,
    updateStatusCode: 1,
    filter: 'statecode eq 0',
    selectFields: [
      'cr123_memosectionbid',
      'cr123_title',
      'cr123_content',
      'cr123_changedate',
      'cr123_updatedate',
      'cr123_memouser',
      'cr123_username',
      'cr123_attachmentname'
    ],
    orderBy: 'cr123_updatedate desc',
    fieldMapping: {
      id: 'cr123_memosectionbid',
      title: 'cr123_title',
      content: 'cr123_content',
      changeDate: 'cr123_changedate',
      updateDate: 'cr123_updatedate',
      memoUser: 'cr123_memouser',
      userName: 'cr123_username',
      attachmentName: 'cr123_attachmentname'
    }
  },
  C: {
    sectionId: 'C',
    displayTitle: '技術検収書',
    entityName: 'cr123_memosectionc',
    createStatusCode: 1,
    updateStatusCode: 1,
    filter: 'statecode eq 0',
    selectFields: [
      'cr123_memosectioncid',
      'cr123_title',
      'cr123_content',
      'cr123_changedate',
      'cr123_updatedate',
      'cr123_memouser',
      'cr123_username',
      'cr123_attachmentname'
    ],
    orderBy: 'cr123_updatedate desc',
    fieldMapping: {
      id: 'cr123_memosectioncid',
      title: 'cr123_title',
      content: 'cr123_content',
      changeDate: 'cr123_changedate',
      updateDate: 'cr123_updatedate',
      memoUser: 'cr123_memouser',
      userName: 'cr123_username',
      attachmentName: 'cr123_attachmentname'
    }
  },
  D: {
    sectionId: 'D',
    displayTitle: '技術ドキュメント',
    entityName: 'cr123_memosectiond',
    createStatusCode: 1,
    updateStatusCode: 1,
    filter: 'statecode eq 0',
    selectFields: [
      'cr123_memosectiondid',
      'cr123_title',
      'cr123_content',
      'cr123_changedate',
      'cr123_updatedate',
      'cr123_memouser',
      'cr123_username',
      'cr123_attachmentname'
    ],
    orderBy: 'cr123_updatedate desc',
    fieldMapping: {
      id: 'cr123_memosectiondid',
      title: 'cr123_title',
      content: 'cr123_content',
      changeDate: 'cr123_changedate',
      updateDate: 'cr123_updatedate',
      memoUser: 'cr123_memouser',
      userName: 'cr123_username',
      attachmentName: 'cr123_attachmentname'
    }
  }
}

/**
 * セクション識別子から設定を取得
 * @param sectionId - セクション識別子（A, B, C, D）
 * @returns セクション設定
 */
export const getSectionConfig = (sectionId: string | null): SectionConfig | null => {
  if (!sectionId || !SECTION_CONFIGS[sectionId]) {
    return null
  }
  return SECTION_CONFIGS[sectionId]
}
