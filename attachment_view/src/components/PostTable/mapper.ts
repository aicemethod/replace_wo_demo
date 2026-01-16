import type { Post } from '../../types'

export interface FieldMapping {
  id: string
  title: string
  content: string
  changeDate: string
  updateDate: string
  memoUser: string
  userName: string
  attachmentName: string
  stepid?: string
  hasReportOutput?: string
}

// Dataverse → Post 変換
export const mapDataverseToPost = (record: any, mapping: FieldMapping): Post => ({
  id: record[mapping.id] || '',
  title: record[mapping.title] || '',
  content: record[mapping.content] || '',
  changeDate: record[mapping.changeDate] ? new Date(record[mapping.changeDate]) : new Date(),
  updateDate: record[mapping.updateDate] ? new Date(record[mapping.updateDate]) : new Date(),
  memoUser: record[mapping.memoUser] || '',
  userName: record[mapping.userName] || '',
  attachmentName: record[mapping.attachmentName] || '',
  stepid: mapping.stepid ? (record[mapping.stepid] || null) : null,
  hasReportOutput: mapping.hasReportOutput ? (record[mapping.hasReportOutput] || false) : false
})

// Post → Dataverse 変換
export const mapPostToDataverse = (post: Partial<Post>, mapping: FieldMapping, statusCode: number): any => {
  const data: any = { statuscode: statusCode }
  if (post.title !== undefined) data[mapping.title] = post.title
  if (post.content !== undefined) data[mapping.content] = post.content
  if (mapping.stepid && post.stepid !== undefined) data[mapping.stepid] = post.stepid
  if (mapping.hasReportOutput && post.hasReportOutput !== undefined) data[mapping.hasReportOutput] = post.hasReportOutput
  return data
}
