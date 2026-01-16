import { useState, useEffect } from 'react'
import { FiX, FiUpload, FiXCircle, FiFile } from 'react-icons/fi'
import type { Post } from '../types'

interface MemoModalProps {
  isOpen: boolean
  isClosing: boolean
  editingPost: Post | null
  onClose: () => void
  onSave: (title: string, content: string, file: File | null) => Promise<boolean>
}

/**
 * メモ入力モーダルコンポーネント
 */
export const MemoModal = ({ isOpen, isClosing, editingPost, onClose, onSave }: MemoModalProps) => {
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)

  // 編集時は初期値を設定
  useEffect(() => {
    if (isOpen) {
      if (editingPost) {
        setFormTitle(editingPost.title)
        setFormContent(editingPost.content)
        setFormFile(editingPost.attachmentFile || null)
      } else {
        setFormTitle('')
        setFormContent('')
        setFormFile(null)
      }
    }
  }, [editingPost, isOpen])

  // モーダルが閉じた後にフォームをリセット
  useEffect(() => {
    if (!isOpen) {
      setFormTitle('')
      setFormContent('')
      setFormFile(null)
    }
  }, [isOpen])

  // モーダルを閉じる（即座に親コンポーネントに通知）
  const handleClose = () => {
    onClose()
  }

  // ファイル選択のハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormFile(file)
    }
  }

  // 保存
  const handleSave = async () => {
    const success = await onSave(formTitle, formContent, formFile)
    // 成功時のみモーダルを閉じる
    if (success) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        animation: isClosing ? 'fadeOut 0.3s ease-in forwards' : 'fadeIn 0.3s ease-out',
        backdropFilter: 'blur(2px)'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: isClosing 
            ? 'modalSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* フォームヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            margin: 0
          }}>
            {editingPost ? 'メモを編集' : 'メモを投稿'}
          </h3>
          <FiX
            size={20}
            style={{ color: '#666', cursor: 'pointer' }}
            onClick={handleClose}
            title="閉じる"
          />
        </div>

        {/* フォーム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* タイトル入力 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              タイトル
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="タイトルを入力"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* メモ内容入力 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              メモ内容
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="メモ内容を入力（改行可能）"
              rows={8}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: '1.6'
              }}
            />
          </div>

          {/* ファイル選択 */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              添付ファイル
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  transition: 'background-color 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                >
                  <FiUpload size={16} />
                  ファイルを選択
                  <input
                    ref={(input) => setFileInputRef(input)}
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {formFile && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <FiFile size={16} style={{ color: '#666' }} />
                    <span style={{ color: '#333' }}>
                      {formFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setFormFile(null)
                        if (fileInputRef) {
                          fileInputRef.value = ''
                        }
                      }}
                      style={{
                        padding: '2px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#d32f2f'
                      }}
                      title="ファイルを削除"
                    >
                      <FiXCircle size={18} />
                    </button>
                  </div>
                )}
                {editingPost?.attachmentName && !formFile && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <FiFile size={16} style={{ color: '#666' }} />
                    <span style={{ color: '#666' }}>
                      現在: {editingPost.attachmentName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setFormFile(null)
                        if (fileInputRef) {
                          fileInputRef.value = ''
                        }
                      }}
                      style={{
                        padding: '2px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#d32f2f'
                      }}
                      title="既存ファイルを削除"
                    >
                      <FiXCircle size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px'
          }}>
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: '#fff',
                color: '#333',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#115ea3',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {editingPost ? '更新' : '投稿'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

