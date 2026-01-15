import { FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw, FiXCircle, FiPaperclip, FiPlus, FiImage, FiChevronDown } from 'react-icons/fi'
import type { Post } from '../../types'
import { usePostTable } from './usePostTable'
import './PostTable.css'

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
  const {
    editTitle,
    editContent,
    editFile,
    editStepid,
    fileInputRef,
    selectedPostId,
    openDropdownId,
    dropdownPosition,
    isSectionD,
    hasNewRow,
    selectedPost,
    setEditTitle,
    setEditContent,
    setEditFile,
    setEditStepid,
    setFileInputRef,
    setSelectedPostId,
    setOpenDropdownId,
    setDropdownPosition,
    handleCheckboxChange,
    handleEditFileChange,
    handleSave,
    handleCancel,
    handleDownloadAttachment,
    getStepidOptions
  } = usePostTable({
    posts,
    editingPostId,
    deletingPostId,
    onSaveEdit,
    onCancelEdit,
    showToast
  })

  return (
    <div className="posttable-container">
      <div className="posttable-header">
        <div className="posttable-header-actions">
          {selectedPost && (
            <>
              <button
                onClick={() => onEdit(selectedPost)}
                className="posttable-button posttable-button-edit"
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
                className="posttable-button posttable-button-delete"
                title="削除"
              >
                <FiTrash2 size={16} />
                <span>削除</span>
              </button>
            </>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="posttable-button posttable-button-refresh"
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
          {onAdd && (
            <button
              onClick={onAdd}
              disabled={hasNewRow}
              className="posttable-button posttable-button-add"
            >
              <FiPlus size={16} />
              <span>追加</span>
            </button>
          )}
        </div>
      </div>

      <div className="posttable-content">
        <table className="posttable-table">
          <thead>
            <tr>
              <th className="posttable-th posttable-th-center">
                <div className="posttable-checkbox-wrapper" />
              </th>
              {!isSectionD && (
                <th className="posttable-th posttable-th-order">表示順</th>
              )}
              <th className="posttable-th posttable-th-title">タイトル</th>
              <th className="posttable-th posttable-th-comment">コメント</th>
              <th className="posttable-th posttable-th-attachment">添付ファイル</th>
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
                  className={`posttable-row ${isDeleting ? 'posttable-row-deleting' : ''} ${isNew ? 'posttable-row-new' : ''}`}
                >
                  <td className="posttable-td posttable-td-center">
                    <label
                      className={`posttable-checkbox-label ${isNew || (isSelected ? false : selectedPostId !== null) ? 'posttable-checkbox-label-disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxChange(post.id)}
                        disabled={isNew || (isSelected ? false : selectedPostId !== null)}
                        className="posttable-checkbox"
                      />
                      <div className={`posttable-checkbox-box ${isSelected ? 'posttable-checkbox-box-checked' : ''}`}>
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

                  {!isSectionD && (
                    <td className="posttable-td">
                      {isEditing ? (
                        (() => {
                          const options = getStepidOptions(post)
                          const dropdownId = `dropdown-${post.id}`
                          const isOpen = openDropdownId === dropdownId
                          const selectedValue = editStepid !== null && editStepid !== undefined ? editStepid : ''
                          const selectedLabel = selectedValue
                            ? options.find(opt => opt.value === selectedValue)?.value || ''
                            : ''

                          return (
                            <div className="custom-dropdown">
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
                                className={`posttable-dropdown-trigger ${selectedValue ? '' : 'posttable-dropdown-trigger-placeholder'}`}
                              >
                                <span>{selectedLabel}{selectedValue && options.find(opt => opt.value === selectedValue)?.isUsed ? ' (使用中)' : ''}</span>
                                <FiChevronDown
                                  size={16}
                                  className={`posttable-dropdown-icon ${isOpen ? 'posttable-dropdown-icon-open' : ''}`}
                                />
                              </div>
                              {isOpen && dropdownPosition && (
                                <div
                                  className="dropdown-menu"
                                  style={{
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    width: `${dropdownPosition.width}px`
                                  }}
                                >
                                  <div
                                    onClick={() => {
                                      setEditStepid(null)
                                      setOpenDropdownId(null)
                                      setDropdownPosition(null)
                                    }}
                                    className="posttable-dropdown-item posttable-dropdown-item-empty"
                                  />
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
                                      className={`posttable-dropdown-item ${opt.value === selectedValue ? 'posttable-dropdown-item-selected' : ''} ${opt.isUsed ? 'posttable-dropdown-item-disabled' : ''}`}
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
                        <div className="posttable-text posttable-text-stepid">
                          {post.stepid !== null && post.stepid !== undefined && post.stepid !== '' ? post.stepid : index + 1}
                        </div>
                      )}
                    </td>
                  )}

                  <td className="posttable-td">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="posttable-input"
                      />
                    ) : (
                      <div className="posttable-text posttable-text-title">
                        {post.title}
                      </div>
                    )}
                  </td>

                  <td className="posttable-td">
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="posttable-textarea"
                      />
                    ) : (
                      <div className="posttable-text posttable-text-content">
                        {post.content}
                      </div>
                    )}
                  </td>

                  <td className="posttable-td">
                    {isEditing ? (
                      <div className="posttable-file-area">
                        <label className="posttable-file-label">
                          <FiPaperclip size={16} />
                          <span>ファイルを添付</span>
                          <input
                            ref={(input) => setFileInputRef(input)}
                            type="file"
                            onChange={handleEditFileChange}
                            className="posttable-file-input"
                          />
                        </label>
                        {editFile && (
                          <div className="posttable-file-info">
                            <FiPaperclip size={14} />
                            <span className="posttable-file-name">
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
                              className="posttable-file-remove"
                              title="ファイルを削除"
                            >
                              <FiXCircle size={14} />
                            </button>
                          </div>
                        )}
                        {post.attachmentName && !editFile && (
                          <div className="posttable-file-info">
                            <FiImage size={14} />
                            <span className="posttable-file-name">
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
                              className="posttable-file-remove"
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
                          className={`posttable-attachment-link ${post.annotationId ? '' : 'posttable-attachment-link-default'}`}
                          onClick={(e) => {
                            e.preventDefault()
                            if (post.annotationId) {
                              handleDownloadAttachment(post.annotationId, post.attachmentName)
                            }
                          }}
                          title={post.attachmentName}
                        >
                          <FiImage size={16} />
                          <span className="posttable-file-name">
                            {post.attachmentName}
                          </span>
                        </div>
                      ) : (
                        <div className="posttable-text posttable-text-empty">-</div>
                      )
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingPostId && (
        <div className="posttable-actions">
          <button
            onClick={handleSave}
            className="posttable-button posttable-button-save"
            title="保存"
          >
            <FiSave size={16} />
            <span>保存</span>
          </button>
          <button
            onClick={handleCancel}
            className="posttable-button posttable-button-cancel"
            title="キャンセル"
          >
            <FiX size={16} />
            <span>キャンセル</span>
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="posttable-empty">
          データがありません
        </div>
      )}
    </div>
  )
}
