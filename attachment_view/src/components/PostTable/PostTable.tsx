import { FiEdit, FiTrash2, FiSave, FiX, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { usePostTable } from './usePostTable'
import { PostRow } from './PostRow/index'
import './PostTable.css'

export const PostTable = () => {
  const {
    posts,
    editingPostId,
    deletingPostId,
    selectedPostId,
    isRefreshing,
    editTitle,
    editContent,
    editFile,
    editStepid,
    editHasReportOutput,
    openDropdownId,
    dropdownPosition,
    fileInputRef,
    isSectionD,
    hasNewRow,
    selectedPost,
    handleEdit,
    handleDelete,
    handleAddNewRow,
    handleRefresh,
    handleCheckboxChange,
    handleEditFileChange,
    handleSave,
    handleCancel,
    handleToggleReportOutput,
    handleDownloadAttachment,
    getStepidOptions,
    setEditTitle,
    setEditContent,
    setEditFile,
    setEditStepid,
    setEditHasReportOutput,
    setOpenDropdownId,
    setDropdownPosition,
    setSelectedPostId
  } = usePostTable()

  const handleRemoveFile = () => {
    setEditFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDropdownToggle = (dropdownId: string, position: { top: number; left: number; width: number }) => {
    setOpenDropdownId(dropdownId)
    setDropdownPosition(position)
  }

  const handleDropdownClose = () => {
    setOpenDropdownId(null)
    setDropdownPosition(null)
  }

  const handleStepidChange = (value: string | null) => {
    setEditStepid(value)
    handleDropdownClose()
  }

  return (
    <div className="posttable-container">
      <div className="posttable-header">
        <div className="posttable-header-actions">
          {selectedPost && (
            <>
              <button onClick={() => handleEdit(selectedPost)} className="posttable-button posttable-button-edit" title="編集">
                <FiEdit size={16} />
                <span>編集</span>
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedPost.id)
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
          <button onClick={handleRefresh} disabled={isRefreshing} className="posttable-button posttable-button-refresh">
            <FiRefreshCw size={16} style={{ animation: isRefreshing ? 'spin 0.8s ease-in-out infinite' : 'none' }} />
            <span>更新</span>
          </button>
          <button onClick={handleAddNewRow} disabled={hasNewRow} className="posttable-button posttable-button-add">
            <FiPlus size={16} />
            <span>追加</span>
          </button>
        </div>
      </div>

      <div className="posttable-content">
        <table className="posttable-table">
          <thead>
            <tr>
              <th className="posttable-th posttable-th-center">
                <div className="posttable-checkbox-wrapper" />
              </th>
              {!isSectionD && <th className="posttable-th posttable-th-order">表示順</th>}
              {!isSectionD && <th className="posttable-th posttable-th-center">帳票出力あり</th>}
              <th className="posttable-th posttable-th-title">タイトル</th>
              <th className="posttable-th posttable-th-comment">コメント</th>
              <th className="posttable-th posttable-th-attachment">添付ファイル</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <PostRow
                key={post.id}
                post={post}
                index={index}
                isEditing={editingPostId === post.id}
                isDeleting={deletingPostId === post.id}
                isSelected={selectedPostId === post.id}
                isNew={post.id.startsWith('new-')}
                isSectionD={isSectionD}
                editTitle={editTitle}
                editContent={editContent}
                editFile={editFile}
                editStepid={editStepid}
                editHasReportOutput={editHasReportOutput}
                openDropdownId={openDropdownId}
                dropdownPosition={dropdownPosition}
                fileInputRef={fileInputRef}
                selectedPostId={selectedPostId}
                getStepidOptions={getStepidOptions}
                onCheckboxChange={handleCheckboxChange}
                onEditTitleChange={setEditTitle}
                onEditContentChange={setEditContent}
                onEditFileChange={handleEditFileChange}
                onRemoveFile={handleRemoveFile}
                onStepidChange={handleStepidChange}
                onDropdownToggle={handleDropdownToggle}
                onDropdownClose={handleDropdownClose}
                onToggleReportOutput={handleToggleReportOutput}
                onDownloadAttachment={handleDownloadAttachment}
                onEditHasReportOutputChange={setEditHasReportOutput}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editingPostId && (
        <div className="posttable-actions">
          <button onClick={handleSave} className="posttable-button posttable-button-save" title="保存">
            <FiSave size={16} />
            <span>保存</span>
          </button>
          <button onClick={handleCancel} className="posttable-button posttable-button-cancel" title="キャンセル">
            <FiX size={16} />
            <span>キャンセル</span>
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="posttable-empty">データがありません</div>
      )}
    </div>
  )
}
