import type { SectionData } from '../types'

/**
 * セクション識別子に基づいてセクションデータを取得
 * @param section - セクション識別子（A, B, C, D など）
 * @returns セクションデータ
 */
export const getSectionData = (section: string | null): SectionData => {
  const baseDate = new Date('2024/01/15 14:30')
  
  switch (section) {
    case 'A':
      return {
        title: 'セクションAのタイトル',
        content: 'これはセクションAに表示されるコンテンツです。',
        changeDate: new Date('2024/01/15 14:30'),
        updateDate: new Date('2024/01/16 10:45'),
        memoUser: 'メモの更新者A',
        userName: 'ユーザーA',
        attachmentName: 'セクションA_添付ファイル.pdf'
      }
    case 'B':
      return {
        title: 'セクションBのタイトル',
        content: 'これはセクションBに表示されるコンテンツです。',
        changeDate: new Date('2024/01/20 09:15'),
        updateDate: new Date('2024/01/21 16:30'),
        memoUser: 'メモの更新者B',
        userName: 'ユーザーB',
        attachmentName: 'セクションB_添付ファイル.pdf'
      }
    case 'C':
      return {
        title: 'セクションCのタイトル',
        content: 'これはセクションCに表示されるコンテンツです。',
        changeDate: new Date('2024/01/25 11:20'),
        updateDate: new Date('2024/01/26 14:10'),
        memoUser: 'メモの更新者C',
        userName: 'ユーザーC',
        attachmentName: 'セクションC_添付ファイル.pdf'
      }
    case 'D':
      return {
        title: 'セクションDのタイトル',
        content: 'これはセクションDに表示されるコンテンツです。',
        changeDate: new Date('2024/01/30 13:45'),
        updateDate: new Date('2024/01/31 09:25'),
        memoUser: 'メモの更新者D',
        userName: 'ユーザーD',
        attachmentName: 'セクションD_添付ファイル.pdf'
      }
    default:
      return {
        title: 'デフォルトのタイトル',
        content: 'セクションが指定されていません。URLパラメータに?section=A|B|C|Dを追加してください。',
        changeDate: baseDate,
        updateDate: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
        memoUser: 'メモの更新者',
        userName: 'ユーザー名',
        attachmentName: '添付ファイル名.pdf'
      }
  }
}

