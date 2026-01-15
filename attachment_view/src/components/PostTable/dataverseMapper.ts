import type { Post, DataverseRecord } from '../../types'
import type { SectionConfig } from './sections'

/**
 * DataverseレコードをPost型に変換
 * @param record - Dataverseレコード
 * @param config - セクション設定
 * @returns Postオブジェクト
 */
export const mapDataverseToPost = (record: DataverseRecord, config: SectionConfig): Post => {
  const mapping = config.fieldMapping

  return {
    id: record[mapping.id] || '',
    title: record[mapping.title] || '',
    content: record[mapping.content] || '',
    changeDate: record[mapping.changeDate] ? new Date(record[mapping.changeDate]) : new Date(),
    updateDate: record[mapping.updateDate] ? new Date(record[mapping.updateDate]) : new Date(),
    memoUser: record[mapping.memoUser] || '',
    userName: record[mapping.userName] || '',
    attachmentName: record[mapping.attachmentName] || ''
  }
}

/**
 * Post型をDataverseレコードに変換
 * @param post - Postオブジェクト
 * @param config - セクション設定
 * @param statusCode - ステータスコード
 * @returns Dataverseレコード
 */
export const mapPostToDataverse = (
  post: Partial<Post>,
  config: SectionConfig,
  statusCode: number
): DataverseRecord => {
  const mapping = config.fieldMapping
  const record: DataverseRecord = {
    statuscode: statusCode
  }

  if (post.title !== undefined) {
    record[mapping.title] = post.title
  }
  if (post.content !== undefined) {
    record[mapping.content] = post.content
  }
  if (post.changeDate) {
    record[mapping.changeDate] = post.changeDate.toISOString()
  }
  if (post.updateDate) {
    record[mapping.updateDate] = post.updateDate.toISOString()
  }
  if (post.memoUser !== undefined) {
    record[mapping.memoUser] = post.memoUser
  }
  if (post.userName !== undefined) {
    record[mapping.userName] = post.userName
  }
  if (post.attachmentName !== undefined) {
    record[mapping.attachmentName] = post.attachmentName
  }

  return record
}
