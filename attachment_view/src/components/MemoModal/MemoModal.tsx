import { useState, useEffect } from 'react'
import { FiX, FiUpload, FiXCircle, FiFile } from 'react-icons/fi'
import type { Post } from '../../types'
import './MemoModal.css'

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
      className={`memomodal-overlay ${isClosing ? 'memomodal-closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`memomodal-content ${isClosing ? 'memomodal-content-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* フォームヘッダー */}
        <div className="memomodal-header">
          <h3 className="memomodal-title">
            {editingPost ? 'メモを編集' : 'メモを投稿'}
          </h3>
          <FiX
            size={20}
            className="memomodal-close"
            onClick={handleClose}
            title="閉じる"
          />
        </div>

        {/* フォーム */}
        <div className="memomodal-form">
          {/* タイトル入力 */}
          <div className="memomodal-field">
            <label className="memomodal-label">
              タイトル
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="タイトルを入力"
              className="memomodal-input"
            />
          </div>

          {/* メモ内容入力 */}
          <div className="memomodal-field">
            <label className="memomodal-label">
              メモ内容
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="メモ内容を入力（改行可能）"
              rows={8}
              className="memomodal-textarea"
            />
          </div>

          {/* ファイル選択 */}
          <div className="memomodal-field">
            <label className="memomodal-label">
              添付ファイル
            </label>
            <div className="memomodal-file-area">
              <div className="memomodal-file-inputs">
                <label className="memomodal-file-label">
                  <FiUpload size={16} />
                  ファイルを選択
                  <input
                    ref={(input) => setFileInputRef(input)}
                    type="file"
                    onChange={handleFileChange}
                    className="memomodal-file-input"
                  />
                </label>
                {formFile && (
                  <div className="memomodal-file-info">
                    <FiFile size={16} className="memomodal-file-icon" />
                    <span className="memomodal-file-name">
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
                      className="memomodal-file-remove"
                      title="ファイルを削除"
                    >
                      <FiXCircle size={18} />
                    </button>
                  </div>
                )}
                {editingPost?.attachmentName && !formFile && (
                  <div className="memomodal-file-info">
                    <FiFile size={16} className="memomodal-file-icon" />
                    <span className="memomodal-file-name">
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
                      className="memomodal-file-remove"
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
          <div className="memomodal-actions">
            <button
              onClick={handleClose}
              className="memomodal-button memomodal-button-cancel"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="memomodal-button memomodal-button-save"
            >
              {editingPost ? '更新' : '投稿'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
