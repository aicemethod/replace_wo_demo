import { useState, useEffect, useCallback } from 'react'
import type { Post } from '../../types'
import type { SectionConfig } from './sections'
import { useToast } from '../Toast/useToast'
import { getEntityRecords, createEntityRecord, updateEntityRecord, deleteEntityRecord } from './dataverse'
import { mapDataverseToPost, mapPostToDataverse } from './dataverseMapper'

/**
 * 投稿を管理するカスタムフック
 * @param sectionData - セクションデータ
 * @param sectionConfig - セクション設定
 * @returns 投稿関連の状態と関数
 */
export const usePosts = (
  sectionData: { userName: string; memoUser: string } | null,
  sectionConfig: SectionConfig | null
) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const { showToast, toasts } = useToast()

  // 初期データ読み込み（1回だけ）
  useEffect(() => {
    if (sectionConfig && !hasInitialLoad) {
      setHasInitialLoad(true)
      loadPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionConfig])

  /**
   * Dataverseから投稿データを読み込む
   */
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

      const mappedPosts = records.map((record: any) => mapDataverseToPost(record, sectionConfig))
      setPosts(mappedPosts)
    } catch (error) {
      console.error('Failed to load posts:', error)
      showToast('データの読み込みに失敗しました', 'info')
    } finally {
      setIsLoading(false)
    }
  }, [sectionConfig, showToast])

  // 検索でフィルタリングされた投稿
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /**
   * 新規投稿を作成
   */
  const createPost = useCallback(async (title: string, content: string, file: File | null) => {
    if (!sectionConfig) {
      showToast('セクション設定が取得できませんでした', 'info')
      return false
    }

    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください。', 'info')
      return false
    }

    try {
      const now = new Date()
      const userName = sectionData?.userName || 'ユーザー名'
      const memoUser = sectionData?.memoUser || 'メモの更新者'

      const postData: Partial<Post> = {
        title,
        content,
        changeDate: now,
        updateDate: now,
        memoUser,
        userName,
        attachmentName: file ? file.name : ''
      }

      const dataverseData = mapPostToDataverse(postData, sectionConfig, sectionConfig.createStatusCode)
      const createdRecord = await createEntityRecord(sectionConfig.entityName, dataverseData)

      // 作成されたレコードをPost型に変換して追加
      const newPost = mapDataverseToPost(createdRecord, sectionConfig)
      setPosts(prev => [newPost, ...prev])
      showToast('メモを投稿しました')
      return true
    } catch (error) {
      console.error('Failed to create post:', error)
      showToast('投稿の保存に失敗しました', 'info')
      return false
    }
  }, [sectionConfig, sectionData, showToast])

  /**
   * 投稿を更新（モーダル経由）
   */
  const updatePost = useCallback(async (postId: string, title: string, content: string, file: File | null) => {
    if (!sectionConfig) {
      showToast('セクション設定が取得できませんでした', 'info')
      return false
    }

    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください。', 'info')
      return false
    }

    try {
      const now = new Date()
      const currentPost = posts.find(p => p.id === postId)
      if (!currentPost) {
        showToast('投稿が見つかりませんでした', 'info')
        return false
      }

      const postData: Partial<Post> = {
        title,
        content,
        updateDate: now,
        attachmentName: file ? file.name : currentPost.attachmentName
      }

      const dataverseData = mapPostToDataverse(
        postData,
        sectionConfig,
        sectionConfig.updateStatusCode || sectionConfig.createStatusCode
      )

      await updateEntityRecord(sectionConfig.entityName, postId, dataverseData)

      // ローカル状態を更新
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              title,
              content,
              updateDate: now,
              attachmentName: file ? file.name : post.attachmentName
            }
          : post
      ))
      showToast('メモを更新しました')
      return true
    } catch (error) {
      console.error('Failed to update post:', error)
      showToast('更新の保存に失敗しました', 'info')
      return false
    }
  }, [sectionConfig, posts, showToast])

  /**
   * インライン編集を開始
   */
  const startEdit = useCallback((post: Post) => {
    setEditingPostId(post.id)
  }, [])

  /**
   * インライン編集をキャンセル
   */
  const cancelEdit = useCallback(() => {
    setEditingPostId(null)
  }, [])

  /**
   * インライン編集を保存
   */
  const saveEdit = useCallback(async (postId: string, title: string, content: string, file: File | null) => {
    if (!sectionConfig) {
      showToast('セクション設定が取得できませんでした', 'info')
      return false
    }

    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください。', 'info')
      return false
    }

    try {
      const now = new Date()
      const currentPost = posts.find(p => p.id === postId)
      if (!currentPost) {
        showToast('投稿が見つかりませんでした', 'info')
        return false
      }

      const postData: Partial<Post> = {
        title,
        content,
        updateDate: now,
        attachmentName: file ? file.name : currentPost.attachmentName
      }

      const dataverseData = mapPostToDataverse(
        postData,
        sectionConfig,
        sectionConfig.updateStatusCode || sectionConfig.createStatusCode
      )

      await updateEntityRecord(sectionConfig.entityName, postId, dataverseData)

      // ローカル状態を更新
      setPosts(prev => prev.map(post => 
        post.id === postId
          ? {
              ...post,
              title,
              content,
              updateDate: now,
              attachmentName: file ? file.name : post.attachmentName
            }
          : post
      ))
      showToast('メモを更新しました')
      setEditingPostId(null)
      return true
    } catch (error) {
      console.error('Failed to update post:', error)
      showToast('更新の保存に失敗しました', 'info')
      return false
    }
  }, [sectionConfig, posts, showToast])

  /**
   * 投稿を削除
   */
  const deletePost = useCallback(async (postId: string) => {
    if (!sectionConfig) {
      showToast('セクション設定が取得できませんでした', 'info')
      return
    }

    try {
      await deleteEntityRecord(sectionConfig.entityName, postId)
      setDeletingPostId(postId)
      setTimeout(() => {
        setPosts(prev => prev.filter(post => post.id !== postId))
        setDeletingPostId(null)
        showToast('メモを削除しました')
      }, 300)
    } catch (error) {
      console.error('Failed to delete post:', error)
      showToast('削除に失敗しました', 'info')
    }
  }, [sectionConfig, showToast])

  /**
   * メモ内容をコピー
   */
  const copyContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      showToast('メモ内容をコピーしました')
    }).catch(() => {
      showToast('コピーに失敗しました', 'info')
    })
  }, [showToast])

  return {
    posts,
    filteredPosts,
    searchQuery,
    setSearchQuery,
    deletingPostId,
    editingPostId,
    isLoading,
    createPost,
    updatePost,
    startEdit,
    cancelEdit,
    saveEdit,
    deletePost,
    copyContent,
    showToast,
    toasts,
    loadPosts
  }
}
