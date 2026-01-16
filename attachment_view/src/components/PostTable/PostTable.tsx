import { useState, useEffect, useCallback, useRef } from 'react'
import { FiEdit, FiTrash2, FiSave, FiX, FiPlus, FiRefreshCw } from 'react-icons/fi'
import type { Post } from '../../types'
import { PostRow } from './PostRow/index'
import { getSectionParam } from '../../utils/sectionParam'
import './PostTable.css'

interface PostTableProps {
  posts: Post[]
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
  const [editHasReportOutput, setEditHasReportOutput] = useState<boolean>(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentSection = getSectionParam()
  const isSectionD = currentSection === 'D'
  const hasNewRow = posts.some(p => p.id.startsWith('new-'))
  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null

  // 編集開始時に状態をリセット
  useEffect(() => {
    if (editingPostId && posts.length > 0) {
      const post = posts.find(p => p.id === editingPostId)
      if (post) {
        setEditTitle(post.title)
        setEditContent(post.content)
        setEditFile(null)
        setEditStepid(post.stepid !== null && post.stepid !== undefined ? String(post.stepid) : null)
        setEditHasReportOutput(post.hasReportOutput || false)
        setSelectedPostId(null)
      }
    } else {
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setEditHasReportOutput(false)
    }
  }, [editingPostId, posts])

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

  const handleCheckboxChange = useCallback((postId: string) => {
    setSelectedPostId(selectedPostId === postId ? null : postId)
  }, [selectedPostId])

  const handleEditFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditFile(file)
    }
  }, [])

  const handleRemoveFile = useCallback(() => {
    setEditFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (editingPostId) {
      const post = posts.find(p => p.id === editingPostId)
      if (post) {
        const stepidValue = editStepid !== null && editStepid !== undefined && editStepid !== '' ? editStepid : null
        const success = await onSaveEdit(editingPostId, editTitle, editContent, editFile, stepidValue)
        if (success) {
          setEditTitle('')
          setEditContent('')
          setEditFile(null)
          setEditStepid(null)
          setEditHasReportOutput(false)
          setSelectedPostId(null)
        }
      }
    }
  }, [editingPostId, posts, editTitle, editContent, editFile, editStepid, onSaveEdit])

  const handleCancel = useCallback(() => {
    const post = posts.find(p => p.id === editingPostId)
    if (post?.id.startsWith('new-')) {
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setOpenDropdownId(null)
      setDropdownPosition(null)
      onCancelEdit()
    } else {
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setEditHasReportOutput(false)
      setOpenDropdownId(null)
      setDropdownPosition(null)
      onCancelEdit()
    }
  }, [editingPostId, posts, onCancelEdit])

  const handleDropdownToggle = useCallback((dropdownId: string, position: { top: number; left: number; width: number }) => {
    setOpenDropdownId(dropdownId)
    setDropdownPosition(position)
  }, [])

  const handleDropdownClose = useCallback(() => {
    setOpenDropdownId(null)
    setDropdownPosition(null)
  }, [])

  const handleStepidChange = useCallback((value: string | null) => {
    setEditStepid(value)
    handleDropdownClose()
  }, [handleDropdownClose])

  const handleToggleReportOutput = useCallback(() => {
  }, [])

  const handleDownloadAttachment = useCallback(async (attachmentName: string, postId: string) => {
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      try {
        const annotation = await (window.parent as any).Xrm.WebApi.retrieveRecord(
          'annotation',
          postId,
          '?$select=documentbody,mimetype,filename'
        )

        if (annotation.documentbody) {
          const byteCharacters = atob(annotation.documentbody)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: annotation.mimetype || 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = annotation.filename || attachmentName
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
  }, [showToast])

  const getStepidOptions = useCallback((post: Post) => {
    const usedStepids = new Set<string>()
    posts.forEach(p => {
      if (p.id !== post.id && p.stepid !== null && p.stepid !== undefined && p.stepid !== '') {
        usedStepids.add(String(p.stepid))
      }
    })

    const options = []
    for (let i = 1; i <= posts.length; i++) {
      const value = String(i)
      const isUsed = usedStepids.has(value)
      options.push({ value, isUsed })
    }
    return options
  }, [posts])

  return (
    <div className="posttable-container">
      <div className="posttable-header">
        <div className="posttable-header-actions">
          {selectedPost && (
            <>
              <button onClick={() => onEdit(selectedPost)} className="posttable-button posttable-button-edit" title="編集">
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
            <button onClick={onRefresh} disabled={isRefreshing} className="posttable-button posttable-button-refresh">
              <FiRefreshCw size={16} style={{ animation: isRefreshing ? 'spin 0.8s ease-in-out infinite' : 'none' }} />
              <span>更新</span>
            </button>
          )}
          {onAdd && (
            <button onClick={onAdd} disabled={hasNewRow} className="posttable-button posttable-button-add">
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
