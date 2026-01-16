export type Post = {
  id: string
  title: string
  content: string
  changeDate: Date
  updateDate: Date
  memoUser: string
  userName: string
  attachmentName: string
  stepid?: string | null
}
