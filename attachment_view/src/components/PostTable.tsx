import { useState, useEffect } from 'react'
import { FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw, FiXCircle, FiPaperclip, FiPlus, FiImage, FiChevronDown } from 'react-icons/fi'
import type { Post } from '../types'
import { getSectionParam } from '../utils/sectionParam'

interface PostTableProps {
  posts: Post[]
  annotations?: Post[]
  deletingPostId: string | null
  editingPostId: string | null
  onEdit: (post: Post) => void
  onSaveEdit: (postId: string, title: string, content: string, file: File | null, stepid: string | null) => Promise<boolean>
  onCancelEdit: () => void
  onDelete: (postId: string) => void
  showToast: (message: string, type?: 'success' | 'info') => void
  onRefresh?: () => void
  onAdd?: () => void
  isRefreshing?: boolean
}

/**
 * 投稿テーブルコンポーネント（インライン編集機能付き）
 */
export const PostTable = ({
  posts,
  deletingPostId,
  editingPostId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  showToast,
  onRefresh,
  onAdd,
  isRefreshing = false
}: PostTableProps) => {
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editStepid, setEditStepid] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  // セクション情報を取得
  const currentSection = getSectionParam()
  const isSectionD = currentSection === 'D'

  // 追加レコード（new-）が表示されているか
  const hasNewRow = posts.some(p => p.id.startsWith('new-'))

  // 編集開始時に状態をリセット
  useEffect(() => {
    if (editingPostId && posts.length > 0) {
      const post = posts.find(p => p.id === editingPostId)
      if (post) {
        setEditingPost(post)
        setEditTitle(post.title)
        setEditContent(post.content)
        setEditFile(post.attachmentFile || null)
        setEditStepid(post.stepid !== null && post.stepid !== undefined ? String(post.stepid) : null)
        setSelectedPostId(null) // 編集開始時に選択を解除
      }
    } else {
      setEditingPost(null)
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setSelectedPostId(null)
    }
  }, [editingPostId, posts])

  // チェックボックスのハンドラー
  const handleCheckboxChange = (postId: string) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null)
    } else {
      setSelectedPostId(postId)
    }
  }

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.custom-dropdown') && !target.closest('.dropdown-menu')) {
        setOpenDropdownId(null)
        setDropdownPosition(null)
      }
    }

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [openDropdownId])

  // 編集時のファイル選択
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditFile(file)
    }
  }

  // 編集保存
  const handleSave = async () => {
    if (editingPostId && editingPost) {
      const stepidValue = editStepid !== null && editStepid !== undefined && editStepid !== '' ? editStepid : null
      const success = await onSaveEdit(editingPostId, editTitle, editContent, editFile, stepidValue)
      if (success) {
        setEditingPost(null)
        setEditTitle('')
        setEditContent('')
        setEditFile(null)
        setEditStepid(null)
        setSelectedPostId(null) // 保存成功時に選択を解除
      }
    }
  }

  // 編集キャンセル
  const handleCancel = () => {
    setEditingPost(null)
    setEditTitle('')
    setEditContent('')
    setEditFile(null)
    setEditStepid(null)
    onCancelEdit()
  }

  // 添付ファイルをダウンロード
  const handleDownloadAttachment = async (annotationId: string, filename: string) => {
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      try {
        const annotation = await (window.parent as any).Xrm.WebApi.retrieveRecord(
          'annotation',
          annotationId,
          '?$select=documentbody,mimetype,filename'
        )

        if (annotation.documentbody) {
          const base64Data = annotation.documentbody
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: annotation.mimetype || 'application/pdf' })

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

  // 選択されたレコードを取得
  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif'
    }}>
      {/* テーブルヘッダーとボタン */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        {/* <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
          投稿一覧
        </div> */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* 選択時のみ表示される編集・削除ボタン */}
          {selectedPost && (
            <>
              <button
                onClick={() => onEdit(selectedPost)}
                style={{
                  padding: '0',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#333',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="編集"
              >
                <FiEdit size={16} />
                <span>編集</span>
              </button>
              <button
                onClick={() => {
                  onDelete(selectedPost.id)
                  setSelectedPostId(null)
                }}
                style={{
                  padding: '0',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#d32f2f',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="削除"
              >
                <FiTrash2 size={16} />
                <span>削除</span>
              </button>
            </>
          )}
          {/* 更新ボタン */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#333',
                fontSize: '14px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isRefreshing ? 0.6 : 1
              }}
            >
              <FiRefreshCw 
                size={16} 
                style={{ 
                  animation: isRefreshing ? 'spin 0.8s ease-in-out infinite' : 'none'
                }} 
              />
              <span>更新</span>
            </button>
          )}
          {/* 追加ボタン */}
          {onAdd && (
            <button
              onClick={onAdd}
              disabled={hasNewRow}
              style={{
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent',
                color: hasNewRow ? '#bbb' : '#333',
                fontSize: '14px',
                cursor: hasNewRow ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: hasNewRow ? 0.5 : 1
              }}
            >
              <FiPlus size={16} />
              <span>追加</span>
            </button>
          )}
        </div>
      </div>

      {/* テーブル */}
      <div style={{ 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif'
        }}>
        <thead>
          <tr>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              width: '40px'
            }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '2px',
                  backgroundColor: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.3
                }}
              />
            </th>
            {!isSectionD && (
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                borderBottom: '1px solid #e0e0e0',
                width: '10%'
              }}>
                表示順
              </th>
            )}
            <th style={{
              padding: '12px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              width: '25%'
            }}>
              タイトル
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              width: '45%'
            }}>
              コメント
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333',
              borderBottom: '1px solid #e0e0e0',
              width: '20%'
            }}>
              添付ファイル
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => {
            const isEditing = editingPostId === post.id
            const isDeleting = deletingPostId === post.id
            const isSelected = selectedPostId === post.id
            const isNew = post.id.startsWith('new-')

            return (
              <tr
                key={post.id}
                style={{
                  borderBottom: '1px solid #e0e0e0',
                  opacity: isDeleting ? 0.6 : 1,
                  transition: 'opacity 0.3s ease-out',
                  animation: isDeleting
                    ? 'slideUp 0.25s ease-in forwards'
                    : isNew
                      ? 'slideDown 0.25s ease-out'
                      : undefined
                }}
              >
                {/* チェックボックス列 */}
                <td style={{
                  padding: '12px',
                  borderBottom: '1px solid #e0e0e0',
                  verticalAlign: 'top',
                  textAlign: 'center'
                }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isNew ? 'not-allowed' : (isSelected || selectedPostId === null ? 'pointer' : 'not-allowed'),
                      opacity: isNew ? 0.5 : (isSelected || selectedPostId === null ? 1 : 0.5)
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(post.id)}
                      disabled={isNew || (isSelected ? false : selectedPostId !== null)}
                      style={{
                        display: 'none'
                      }}
                    />
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '2px',
                        backgroundColor: isSelected ? '#115ea3' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isSelected && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                </td>

                {/* 表示順列 */}
                {!isSectionD && (
                  <td style={{
                    padding: '12px',
                    borderBottom: '1px solid #e0e0e0',
                    verticalAlign: 'top'
                  }}>
                  {isEditing ? (
                    (() => {
                      // 使用されているstepidを取得（現在編集中のレコードを除く）
                      const usedStepids = new Set<string>()
                      posts.forEach(p => {
                        if (p.id !== post.id && p.stepid !== null && p.stepid !== undefined && p.stepid !== '') {
                          usedStepids.add(String(p.stepid))
                        }
                      })
                      
                      // 選択可能なオプションを生成（1からposts.lengthまで）
                      const options = []
                      for (let i = 1; i <= posts.length; i++) {
                        const value = String(i)
                        const isUsed = usedStepids.has(value)
                        options.push({ value, isUsed })
                      }
                      
                      const dropdownId = `dropdown-${post.id}`
                      const isOpen = openDropdownId === dropdownId
                      const selectedValue = editStepid !== null && editStepid !== undefined ? editStepid : ''
                      const selectedLabel = selectedValue 
                        ? options.find(opt => opt.value === selectedValue)?.value || ''
                        : ''

                      return (
                        <div 
                          className="custom-dropdown"
                          style={{ position: 'relative', width: '100%' }}
                        >
                          <div
                            onClick={(e) => {
                              if (!isOpen) {
                                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
                                setDropdownPosition({
                                  top: rect.bottom + 4,
                                  left: rect.left,
                                  width: rect.width
                                })
                                setOpenDropdownId(dropdownId)
                              } else {
                                setOpenDropdownId(null)
                                setDropdownPosition(null)
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #e0e0e0',
                              borderRadius: '2px',
                              fontSize: '14px',
                              fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                              boxSizing: 'border-box',
                              backgroundColor: '#fff',
                              cursor: 'pointer',
                              color: selectedValue ? '#333' : '#999',
                              transition: 'border-color 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              minHeight: '28px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#115ea3'
                            }}
                            onMouseLeave={(e) => {
                              if (!isOpen) {
                                e.currentTarget.style.borderColor = '#e0e0e0'
                              }
                            }}
                          >
                            <span>{selectedLabel}{selectedValue && options.find(opt => opt.value === selectedValue)?.isUsed ? ' (使用中)' : ''}</span>
                            <FiChevronDown 
                              size={16} 
                              style={{ 
                                color: '#666',
                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }} 
                            />
                          </div>
                          {isOpen && dropdownPosition && (
                            <div
                              className="dropdown-menu"
                              style={{
                                position: 'fixed',
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`,
                                width: `${dropdownPosition.width}px`,
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '2px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                zIndex: 10000,
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}
                            >
                              <div
                                onClick={() => {
                                  setEditStepid(null)
                                  setOpenDropdownId(null)
                                  setDropdownPosition(null)
                                }}
                                style={{
                                  height: '32px',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  color: '#999',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fff'
                                }}
                              >
                                
                              </div>
                              {options.map(opt => (
                                <div
                                  key={opt.value}
                                  onClick={() => {
                                    if (!opt.isUsed) {
                                      setEditStepid(opt.value)
                                      setOpenDropdownId(null)
                                      setDropdownPosition(null)
                                    }
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    color: opt.isUsed ? '#bbb' : '#333',
                                    cursor: opt.isUsed ? 'not-allowed' : 'pointer',
                                    backgroundColor: opt.value === selectedValue ? '#f0f7ff' : '#fff',
                                    transition: 'background-color 0.2s ease',
                                    opacity: opt.isUsed ? 0.6 : 1
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!opt.isUsed) {
                                      e.currentTarget.style.backgroundColor = '#f5f5f5'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = opt.value === selectedValue ? '#f0f7ff' : '#fff'
                                  }}
                                >
                                  {opt.value}{opt.isUsed ? ' (使用中)' : ''}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()
                  ) : (
                    <div style={{
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {post.stepid !== null && post.stepid !== undefined && post.stepid !== '' ? post.stepid : index + 1}
                    </div>
                  )}
                  </td>
                )}

                {/* タイトル列 */}
                <td style={{
                  padding: '12px',
                  borderBottom: '1px solid #e0e0e0',
                  verticalAlign: 'top'
                }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '2px',
                        fontSize: '14px',
                        fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                        color: '#333',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#115ea3'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: '14px',
                      color: '#333',
                      fontWeight: '500'
                    }}>
                      {post.title}
                    </div>
                  )}
                </td>

                {/* コメント列 */}
                <td style={{
                  padding: '12px',
                  borderBottom: '1px solid #e0e0e0',
                  verticalAlign: 'top'
                }}>
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '2px',
                        fontSize: '14px',
                        fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        lineHeight: '1.6',
                        backgroundColor: '#fff',
                        color: '#333',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#115ea3'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0'
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: '14px',
                      color: '#333',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {post.content}
                    </div>
                  )}
                </td>

                {/* 画像列 */}
                <td style={{
                  padding: '12px',
                  borderBottom: '1px solid #e0e0e0',
                  verticalAlign: 'top'
                }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#333',
                        width: 'fit-content'
                      }}>
                        <FiPaperclip size={16} />
                        <span>ファイルを添付</span>
                        <input
                          ref={(input) => setFileInputRef(input)}
                          type="file"
                          onChange={handleEditFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {editFile && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          <FiPaperclip size={14} />
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px'
                          }}>
                            {editFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setEditFile(null)
                              if (fileInputRef) {
                                fileInputRef.value = ''
                              }
                            }}
                            style={{
                              padding: '0',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#d32f2f'
                            }}
                            title="ファイルを削除"
                          >
                            <FiXCircle size={14} />
                          </button>
                        </div>
                      )}
                      {post.attachmentName && !editFile && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: '#666'
                        }}>
                          <FiImage size={14} />
                          <span style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px'
                          }}>
                            {post.attachmentName}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setEditFile(null)
                              if (fileInputRef) {
                                fileInputRef.value = ''
                              }
                            }}
                            style={{
                              padding: '0',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#d32f2f'
                            }}
                            title="既存ファイルを削除"
                          >
                            <FiXCircle size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    post.attachmentName ? (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '6px',
                          cursor: post.annotationId ? 'pointer' : 'default',
                          color: '#666',
                          fontSize: '14px'
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          if (post.annotationId) {
                            handleDownloadAttachment(post.annotationId, post.attachmentName)
                          }
                        }}
                        title={post.attachmentName}
                      >
                        <FiImage size={16} />
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '150px'
                        }}>
                          {post.attachmentName}
                        </span>
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontSize: '14px' }}>-</div>
                    )
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
      
      {/* 編集モード時の保存・キャンセルボタン */}
      {editingPostId && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '12px 16px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <button
            onClick={handleSave}
            style={{
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#115ea3',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="保存"
          >
            <FiSave size={16} />
            <span>保存</span>
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="キャンセル"
          >
            <FiX size={16} />
            <span>キャンセル</span>
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          データがありません
        </div>
      )}
    </div>
  )
}

