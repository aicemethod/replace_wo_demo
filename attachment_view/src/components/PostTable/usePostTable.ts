import { useState, useEffect, useCallback } from 'react'
import type { Post } from '../../types'
import { getSectionParam } from '../../utils/sectionParam/index'

interface UsePostTableProps {
  posts: Post[]
  editingPostId: string | null
  deletingPostId: string | null
  onSaveEdit: (postId: string, title: string, content: string, file: File | null, stepid: string | null) => Promise<boolean>
  onCancelEdit: () => void
  showToast: (message: string, type?: 'success' | 'info') => void
}

/**
 * PostTableコンポーネントのロジック
 */
export const usePostTable = ({
  posts,
  editingPostId,
  deletingPostId,
  onSaveEdit,
  onCancelEdit,
  showToast
}: UsePostTableProps) => {
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editStepid, setEditStepid] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  const currentSection = getSectionParam()
  const isSectionD = currentSection === 'D'
  const hasNewRow = posts.some(p => p.id.startsWith('new-'))
  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null

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
        setSelectedPostId(null)
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
    setSelectedPostId(prev => prev === postId ? null : postId)
  }, [])

  const handleEditFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditFile(file)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (editingPostId && editingPost) {
      const stepidValue = editStepid !== null && editStepid !== undefined && editStepid !== '' ? editStepid : null
      const success = await onSaveEdit(editingPostId, editTitle, editContent, editFile, stepidValue)
      if (success) {
        setEditingPost(null)
        setEditTitle('')
        setEditContent('')
        setEditFile(null)
        setEditStepid(null)
        setSelectedPostId(null)
      }
    }
  }, [editingPostId, editingPost, editTitle, editContent, editFile, editStepid, onSaveEdit])

  const handleCancel = useCallback(() => {
    setEditingPost(null)
    setEditTitle('')
    setEditContent('')
    setEditFile(null)
    setEditStepid(null)
    onCancelEdit()
  }, [onCancelEdit])

  const handleDownloadAttachment = useCallback(async (annotationId: string, filename: string) => {
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

  return {
    editTitle,
    editContent,
    editFile,
    editStepid,
    editingPost,
    fileInputRef,
    selectedPostId,
    openDropdownId,
    dropdownPosition,
    currentSection,
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
  }
}
