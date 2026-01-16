import { useState, useEffect } from 'react'
import { FiFileText, FiUser, FiEdit, FiCopy, FiTrash2, FiFile, FiUpload } from 'react-icons/fi'
import type { Post } from '../types'
import { formatDate } from '../utils/dateFormatter'
import { ANIMATION_DELAY } from '../constants'
import { PDF_MIME_TYPE, PDF_EXTENSION } from '../constants'

interface PostCardProps {
  post: Post
  index: number
  deletingPostId: string | null
  editingPostId: string | null
  onEdit: (post: Post) => void
  onSaveEdit: (postId: string, title: string, content: string, file: File | null) => Promise<boolean>
  onCancelEdit: () => void
  onCopy: (content: string) => void
  onDelete: (postId: string) => void
  showToast: (message: string, type?: 'success' | 'info') => void
}

/**
 * 投稿カードコンポーネント（インライン編集機能付き）
 */
export const PostCard = ({
  post,
  index,
  deletingPostId,
  editingPostId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onCopy,
  onDelete,
  showToast
}: PostCardProps) => {
  const [editTitle, setEditTitle] = useState(post.title)
  const [editContent, setEditContent] = useState(post.content)
  const [editFile, setEditFile] = useState<File | null>(post.attachmentFile || null)

  const isEditing = editingPostId === post.id

  // 編集開始時に状態をリセット
  useEffect(() => {
    if (isEditing) {
      setEditTitle(post.title)
      setEditContent(post.content)
      setEditFile(post.attachmentFile || null)
    }
  }, [isEditing, post.title, post.content, post.attachmentFile])

  // 編集時のファイル選択
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === PDF_MIME_TYPE) {
        setEditFile(file)
      } else {
        showToast('PDFファイルのみアップロードできます。', 'info')
        e.target.value = ''
      }
    }
  }

  // 編集保存
  const handleSave = async () => {
    await onSaveEdit(post.id, editTitle, editContent, editFile)
  }

  // systemuserフォームを開く
  const handleOpenUserForm = (userId: string) => {
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.Navigation) {
      try {
        const formOptions: any = {
          entityName: 'systemuser',
          entityId: userId,
          openInNewWindow: true
        }
        ;(window.parent as any).Xrm.Navigation.openForm(formOptions)
      } catch (err: any) {
        console.error('Failed to open user form:', err)
        showToast('ユーザーフォームを開けませんでした', 'info')
      }
    } else {
      showToast('Xrm.Navigationが利用できません', 'info')
    }
  }

  // 添付ファイルをダウンロード
  const handleDownloadAttachment = async (annotationId: string, filename: string) => {
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      try {
        // annotationレコードからdocumentbodyを取得
        const annotation = await (window.parent as any).Xrm.WebApi.retrieveRecord(
          'annotation',
          annotationId,
          '?$select=documentbody,mimetype,filename'
        )

        if (annotation.documentbody) {
          // Base64データをBlobに変換
          const base64Data = annotation.documentbody
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: annotation.mimetype || 'application/pdf' })

          // ダウンロード
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = annotation.filename || filename || 'attachment.pdf'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          showToast('添付ファイルが見つかりません', 'info')
        }
      } catch (err: any) {
        console.error('Failed to download attachment:', err)
        showToast('ファイルのダウンロードに失敗しました', 'info')
      }
    } else {
      showToast('Xrm.WebApiが利用できません', 'info')
    }
  }

  return (
    <div
      style={{
        marginTop: '16px',
        animation: deletingPostId === post.id 
          ? 'fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
          : 'fadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animationFillMode: 'both',
        animationDelay: deletingPostId === post.id ? '0s' : `${index * ANIMATION_DELAY}s`
      }}
    >
      {/* 投稿エリア */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#fff'
      }}>
        {/* 変更日 */}
        <div style={{ fontSize: '12px', color: '#666' }}>
          変更日：{formatDate(post.changeDate)}
        </div>

        {/* メモアイコン、更新者情報、アクションアイコン */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <FiFileText size={16} style={{ color: '#666' }} />
          <span style={{ fontSize: '14px', color: '#333' }}>{post.memoUser}</span>
          <FiUser size={16} style={{ color: '#666' }} />
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              if (post.userId) {
                handleOpenUserForm(post.userId)
              }
            }}
            style={{ 
              fontSize: '14px', 
              color: '#0066cc', 
              textDecoration: 'none',
              cursor: post.userId ? 'pointer' : 'default'
            }}
          >
            {post.userName}
          </a>
          <div style={{ 
            marginLeft: 'auto', 
            display: 'flex', 
            gap: '12px',
            alignItems: 'center'
          }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#115ea3',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  保存
                </button>
                <button
                  onClick={onCancelEdit}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: '#333',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <FiEdit 
                  size={16} 
                  style={{ color: '#666', cursor: 'pointer' }} 
                  onClick={() => onEdit(post)}
                  title="編集"
                />
                <FiCopy 
                  size={16} 
                  style={{ color: '#666', cursor: 'pointer' }} 
                  onClick={() => onCopy(post.content)}
                  title="コピー"
                />
                <FiTrash2 
                  size={16} 
                  style={{ color: '#666', cursor: 'pointer' }} 
                  onClick={() => onDelete(post.id)}
                  title="削除"
                />
              </>
            )}
          </div>
        </div>

        {/* タイトル */}
        <div style={{ minHeight: '32px', marginTop: '4px' }}>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#333',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                outline: 'none',
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
          ) : (
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {post.title}
            </div>
          )}
        </div>

        {/* 内容 */}
        <div style={{ minHeight: '96px' }}>
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              style={{
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.6',
                borderRadius: '4px',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                outline: 'none',
                resize: 'vertical',
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
          ) : (
            <div style={{ 
              fontSize: '14px', 
              color: '#333',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {post.content}
            </div>
          )}
        </div>

        {/* 添付ファイル */}
        {isEditing ? (
          <div style={{ marginTop: '4px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              fontSize: '14px',
              width: 'fit-content'
            }}>
              <FiUpload size={16} />
              ファイルを選択（PDFのみ）
              <input
                type="file"
                accept={`${PDF_EXTENSION},${PDF_MIME_TYPE}`}
                onChange={handleEditFileChange}
                style={{ display: 'none' }}
              />
            </label>
            {editFile && (
              <span style={{
                fontSize: '14px',
                color: '#666',
                marginLeft: '12px'
              }}>
                {editFile.name}
              </span>
            )}
            {post.attachmentName && !editFile && (
              <span style={{
                fontSize: '14px',
                color: '#666',
                marginLeft: '12px'
              }}>
                現在: {post.attachmentName}
              </span>
            )}
          </div>
        ) : (
          post.attachmentName && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginTop: '4px'
            }}>
              <FiFile size={16} style={{ color: '#666' }} />
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  if (post.annotationId) {
                    handleDownloadAttachment(post.annotationId, post.attachmentName)
                  }
                }}
                style={{ 
                  fontSize: '14px', 
                  color: '#0066cc', 
                  textDecoration: 'none',
                  cursor: post.annotationId ? 'pointer' : 'default'
                }}
              >
                {post.attachmentName}
              </a>
            </div>
          )
        )}

        {/* 修正日 */}
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          marginTop: '4px'
        }}>
          修正日：{formatDate(post.updateDate)}
        </div>
      </div>
    </div>
  )
}

