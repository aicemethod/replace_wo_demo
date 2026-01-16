import { useState, useEffect, useCallback, useRef } from 'react'
import type { Post } from '../../types'
import { getEntityRecords, createEntityRecord, updateEntityRecord, deleteEntityRecord } from './dataverse'
import { mapDataverseToPost, mapPostToDataverse } from './mapper'
import { getSectionConfig, getSectionParam } from './config'

export const usePostTable = () => {
  const [sectionConfig, setSectionConfig] = useState<ReturnType<typeof getSectionConfig>>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 編集用の状態
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editStepid, setEditStepid] = useState<string | null>(null)
  const [editHasReportOutput, setEditHasReportOutput] = useState<boolean>(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSectionD = false
  const hasNewRow = posts.some(p => p.id.startsWith('new-'))
  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) : null

  // セクション設定の初期化
  useEffect(() => {
    const sectionId = getSectionParam()
    setSectionConfig(getSectionConfig(sectionId))
  }, [])

  // データ読み込み
  const loadPosts = useCallback(async () => {
    if (!sectionConfig) return

    setIsLoading(true)
    try {
      const records = await getEntityRecords(
        sectionConfig.entityName,
        sectionConfig.filter,
        sectionConfig.selectFields,
        sectionConfig.orderBy
      )
      const mappedPosts = records.map(record => mapDataverseToPost(record, sectionConfig.fieldMapping))
      setPosts(mappedPosts)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sectionConfig])

  // 初期読み込み
  useEffect(() => {
    if (sectionConfig) {
      loadPosts()
    }
  }, [sectionConfig, loadPosts])

  const handleEdit = useCallback((post: Post) => {
    setEditingPostId(post.id)
    setSelectedPostId(null)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditTitle('')
    setEditContent('')
    setEditFile(null)
    setEditStepid(null)
    setEditHasReportOutput(false)
    setOpenDropdownId(null)
    setDropdownPosition(null)
    setTimeout(() => {
      setEditingPostId(null)
    }, 100)
  }, [])

  const handleSaveEdit = useCallback(async (postId: string, title: string, content: string, file: File | null, stepid: string | null, hasReportOutput?: boolean) => {
    if (!sectionConfig) return false

    try {
      const postData: Partial<Post> = {
        title,
        content,
        stepid,
        hasReportOutput
      }
      const dataverseData = mapPostToDataverse(postData, sectionConfig.fieldMapping, sectionConfig.createStatusCode)

      if (postId.startsWith('new-')) {
        await createEntityRecord(sectionConfig.entityName, dataverseData)
        await loadPosts()
      } else {
        await updateEntityRecord(sectionConfig.entityName, postId, dataverseData)
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, ...postData, updateDate: new Date() }
            : post
        ))
      }

      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setOpenDropdownId(null)
      setDropdownPosition(null)
      setTimeout(() => {
        setEditingPostId(null)
      }, 100)
      return true
    } catch (error) {
      console.error('Failed to save:', error)
      return false
    }
  }, [sectionConfig, loadPosts])

  const handleToggleReportOutput = useCallback(async (postId: string) => {
    if (!sectionConfig) return

    try {
      const post = posts.find(p => p.id === postId)
      if (post) {
        const dataverseData = mapPostToDataverse(
          { hasReportOutput: !post.hasReportOutput },
          sectionConfig.fieldMapping,
          sectionConfig.updateStatusCode || sectionConfig.createStatusCode
        )
        await updateEntityRecord(sectionConfig.entityName, postId, dataverseData)
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, hasReportOutput: !p.hasReportOutput, updateDate: new Date() }
            : p
        ))
      }
    } catch (error) {
      console.error('Failed to toggle report output:', error)
    }
  }, [posts, sectionConfig])

  const handleDownloadAttachment = useCallback(async (attachmentName: string, postId: string) => {
    try {
      const xrm = (window.parent as any).Xrm?.WebApi
      if (!xrm) return

      const annotation = await xrm.retrieveRecord('annotation', postId, '?$select=documentbody,mimetype,filename')
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
      }
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }, [])

  const handleDelete = useCallback(async (postId: string) => {
    if (postId.startsWith('new-')) {
      setPosts(prev => prev.filter(post => post.id !== postId))
      return
    }

    if (!sectionConfig) return

    setDeletingPostId(postId)
    try {
      await deleteEntityRecord(sectionConfig.entityName, postId)
      setTimeout(() => {
        setPosts(prev => prev.filter(post => post.id !== postId))
        setDeletingPostId(null)
        setSelectedPostId(null)
      }, 300)
    } catch (error) {
      console.error('Failed to delete:', error)
      setDeletingPostId(null)
    }
  }, [sectionConfig])

  const handleAddNewRow = useCallback(() => {
    const newId = `new-${Date.now()}`
    const newPost: Post = {
      id: newId,
      title: '',
      content: '',
      changeDate: new Date(),
      updateDate: new Date(),
      memoUser: '',
      userName: '',
      attachmentName: '',
      stepid: null,
      hasReportOutput: false
    }
    setPosts(prev => [newPost, ...prev])
    setEditingPostId(newId)
    setSelectedPostId(null)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadPosts()
    setEditingPostId(null)
    setDeletingPostId(null)
    setSelectedPostId(null)
    setIsRefreshing(false)
  }, [loadPosts])

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

  const handleSave = useCallback(async () => {
    if (editingPostId) {
      const post = posts.find(p => p.id === editingPostId)
      if (post) {
        const stepidValue = editStepid !== null && editStepid !== undefined && editStepid !== '' ? editStepid : null
        await handleSaveEdit(editingPostId, editTitle, editContent, editFile, stepidValue, editHasReportOutput)
      }
    }
  }, [editingPostId, posts, editTitle, editContent, editFile, editStepid, editHasReportOutput, handleSaveEdit])

  const handleCancel = useCallback(() => {
    const post = posts.find(p => p.id === editingPostId)
    if (post?.id.startsWith('new-')) {
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setOpenDropdownId(null)
      setDropdownPosition(null)
      setEditingPostId(null)
      setPosts(prev => prev.filter(p => p.id !== editingPostId))
      setSelectedPostId(null)
    } else {
      handleCancelEdit()
    }
  }, [editingPostId, posts, handleCancelEdit])

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
    posts,
    editingPostId,
    deletingPostId,
    selectedPostId,
    isRefreshing,
    isLoading,
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
    handleCancelEdit,
    handleSaveEdit,
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
  }
}
