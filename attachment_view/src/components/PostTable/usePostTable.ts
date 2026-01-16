import { useState, useEffect, useCallback, useRef } from 'react'
import type { Post } from '../../types'

// モックデータ
const initialPosts: Post[] = [
  {
    id: '1',
    title: 'サンプルタイトル1',
    content: 'これはサンプルのコンテンツです。',
    changeDate: new Date(),
    updateDate: new Date(),
    memoUser: 'ユーザー1',
    userName: 'ユーザー名1',
    attachmentName: 'sample1.pdf',
    stepid: '1',
    hasReportOutput: true
  },
  {
    id: '2',
    title: 'サンプルタイトル2',
    content: 'これは2つ目のサンプルコンテンツです。',
    changeDate: new Date(),
    updateDate: new Date(),
    memoUser: 'ユーザー2',
    userName: 'ユーザー名2',
    attachmentName: '',
    stepid: '2',
    hasReportOutput: false
  },
  {
    id: '3',
    title: 'サンプルタイトル3',
    content: 'これは3つ目のサンプルコンテンツです。',
    changeDate: new Date(),
    updateDate: new Date(),
    memoUser: 'ユーザー3',
    userName: 'ユーザー名3',
    attachmentName: 'sample3.jpg',
    stepid: '3',
    hasReportOutput: true
  }
]

export const usePostTable = () => {
  // 状態管理
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // ハンドラー関数
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
    setEditTitle('')
    setEditContent('')
    setEditFile(null)
    setEditStepid(null)
    setOpenDropdownId(null)
    setDropdownPosition(null)
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
          ...post,
          title,
          content,
          attachmentName: file ? file.name : post.attachmentName,
          stepid: stepid || post.stepid,
          hasReportOutput: hasReportOutput !== undefined ? hasReportOutput : post.hasReportOutput,
          updateDate: new Date()
        }
        : post
    ))
    setTimeout(() => {
      setEditingPostId(null)
    }, 100)
    return true
  }, [])

  const handleToggleReportOutput = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, hasReportOutput: !post.hasReportOutput, updateDate: new Date() }
        : post
    ))
  }, [])

  const handleDownloadAttachment = useCallback((attachmentName: string) => {
    // モックデータなので、実際のダウンロード処理は実装しない
    // 実際の実装では、ファイルのURLやBlobを作成してダウンロード
    const link = document.createElement('a')
    link.href = '#' // 実際のファイルURLに置き換える
    link.download = attachmentName
    link.click()
  }, [])

  const handleDelete = useCallback((postId: string) => {
    setDeletingPostId(postId)
    setTimeout(() => {
      setPosts(prev => prev.filter(post => post.id !== postId))
      setDeletingPostId(null)
      setSelectedPostId(null)
    }, 300)
  }, [])

  const handleAddNewRow = useCallback(() => {
    const newId = `new-${Date.now()}`
    const newPost: Post = {
      id: newId,
      title: '',
      content: '',
      changeDate: new Date(),
      updateDate: new Date(),
      memoUser: '新規ユーザー',
      userName: '新規ユーザー名',
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
    // 初期データにリセット
    setTimeout(() => {
      setPosts(initialPosts)
      setEditingPostId(null)
      setDeletingPostId(null)
      setSelectedPostId(null)
      setIsRefreshing(false)
    }, 500)
  }, [])

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
      // 新規行の場合は、先に編集状態を解除してから即座に削除
      setEditTitle('')
      setEditContent('')
      setEditFile(null)
      setEditStepid(null)
      setOpenDropdownId(null)
      setDropdownPosition(null)
      setEditingPostId(null)
      // 即座に削除（アニメーションなし）
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
    // 状態
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
    // 計算値
    isSectionD,
    hasNewRow,
    selectedPost,
    // ハンドラー
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
    // セッター
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
