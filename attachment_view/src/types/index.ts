// セクションごとのデータ型定義
export type SectionData = {
  title: string
  content: string
  changeDate: Date
  updateDate: Date
  memoUser: string
  userName: string
  attachmentName: string
}

// 投稿データの型定義
export type Post = {
  id: string
  title: string
  content: string
  changeDate: Date
  updateDate: Date
  memoUser: string
  userName: string
  attachmentName: string
  attachmentFile?: File
  annotationId?: string // annotationレコードのID（添付ファイルダウンロード用）
  userId?: string | null // systemuserのID（ユーザー名クリックでフォームを開く用）
  stepid?: string | null // 表示順（annotationレコードのstepid）
}

// Dataverseエンティティレコードの型（生データ）
export type DataverseRecord = {
  [key: string]: any
}

// トースト通知の型定義
export type Toast = {
  id: string
  message: string
  type: 'success' | 'info'
}

