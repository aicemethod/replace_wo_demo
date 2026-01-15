import { useState } from 'react'
import { useSectionData } from './hooks/useSectionData'
import { usePosts } from './hooks/usePosts'
import { useAnnotations } from './hooks/useAnnotations'
import { PostTable } from './components/PostTable'
import { MemoModal } from './components/MemoModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { Toast } from './components/Toast'
import { Animations } from './components/Animations'
import type { Post } from './types'
import { MODAL_CLOSE_DELAY } from './constants'

/**
 * メインアプリケーションコンポーネント
 */
function App() {
  // セクションデータの取得
  const { sectionData, sectionConfig } = useSectionData()

  // 投稿管理
  const {
    filteredPosts,
    deletingPostId,
    editingPostId,
    isLoading,
    createPost,
    updatePost,
    startEdit,
    cancelEdit,
    saveEdit,
    deletePost,
    showToast,
    toasts,
    loadPosts
  } = usePosts(sectionData, sectionConfig)

  // annotationレコード管理
  const {
    annotations,
    isLoadingAnnotations,
    deletingAnnotationId,
    editingAnnotationId,
    loadAnnotations,
    handleAddNewRow,
    handleEditAnnotation,
    handleCancelAnnotationEdit,
    handleSaveAnnotationEdit,
    saveAnnotationViaModal,
    deleteAnnotation
  } = useAnnotations(sectionConfig)

  // モーダル状態管理
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false)
  const [isMemoModalClosing, setIsMemoModalClosing] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isAnnotationMode, setIsAnnotationMode] = useState(false)

  // メモモーダルを閉じる
  const closeMemoModal = () => {
    setIsMemoModalClosing(true)
    setTimeout(() => {
      setIsMemoModalOpen(false)
      setIsMemoModalClosing(false)
      setEditingPost(null)
      setIsAnnotationMode(false)
    }, MODAL_CLOSE_DELAY)
  }

  // 投稿を保存（モーダル経由）
  const handleSavePost = async (title: string, content: string, file: File | null): Promise<boolean> => {
    if (isAnnotationMode) {
      const result = await saveAnnotationViaModal(editingPost, title, content, file)
      if (result) {
        setIsAnnotationMode(false)
      }
      return result
    } else {
      if (editingPost) {
        return await updatePost(editingPost.id, title, content, file)
      } else {
        return await createPost(title, content, file)
      }
    }
  }

  // 削除確認モーダルを開く
  const openDeleteConfirm = (postId: string) => {
    setDeleteConfirmPostId(postId)
  }

  // 削除確認モーダルを閉じる
  const closeDeleteConfirm = () => {
    setIsModalClosing(true)
    setTimeout(() => {
      setDeleteConfirmPostId(null)
      setIsModalClosing(false)
    }, MODAL_CLOSE_DELAY)
  }

  // 投稿を削除
  const handleDeletePost = async () => {
    if (deleteConfirmPostId) {
      const isAnnotation = annotations.some(a => a.id === deleteConfirmPostId)
      if (isAnnotation) {
        await deleteAnnotation(deleteConfirmPostId)
        closeDeleteConfirm()
      } else {
        deletePost(deleteConfirmPostId)
        closeDeleteConfirm()
      }
    }
  }

  // 再読み込み
  const handleRefresh = async () => {
    await Promise.all([
      loadPosts(),
      loadAnnotations()
    ])
  }

  // セクションデータが読み込まれるまで表示しない
  if (!sectionData) {
    return <div>読み込み中...</div>
  }

  // すべての投稿を結合（通常の投稿 + annotationレコード）
  const allPosts = [...annotations, ...filteredPosts]

  return (
    <div style={{
      fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* 投稿テーブル（スクロール可能） */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <PostTable
          posts={allPosts}
          deletingPostId={allPosts.find(p => {
            const isAnnotation = annotations.some(a => a.id === p.id)
            return isAnnotation
              ? deletingAnnotationId === p.id
              : deletingPostId === p.id
          })?.id || null}
          editingPostId={allPosts.find(p => {
            const isAnnotation = annotations.some(a => a.id === p.id)
            return isAnnotation
              ? editingAnnotationId === p.id
              : editingPostId === p.id
          })?.id || null}
          onEdit={(post) => {
            const isAnnotation = annotations.some(a => a.id === post.id)
            if (isAnnotation) {
              handleEditAnnotation(post)
            } else {
              startEdit(post)
            }
          }}
          onSaveEdit={(postId, title, content, file, stepid) => {
            const isAnnotation = annotations.some(a => a.id === postId)
            if (isAnnotation) {
              return handleSaveAnnotationEdit(postId, title, content, file, stepid)
            } else {
              // 通常の投稿にはstepidは適用しない
              return saveEdit(postId, title, content, file)
            }
          }}
          onCancelEdit={() => {
            if (editingAnnotationId) {
              handleCancelAnnotationEdit()
            } else {
              cancelEdit()
            }
          }}
          onDelete={openDeleteConfirm}
          showToast={showToast}
          onRefresh={handleRefresh}
          onAdd={handleAddNewRow}
          isRefreshing={isLoading || isLoadingAnnotations}
        />
      </div>

      {/* メモ入力モーダル */}
      <MemoModal
        isOpen={isMemoModalOpen}
        isClosing={isMemoModalClosing}
        editingPost={editingPost}
        onClose={closeMemoModal}
        onSave={handleSavePost}
      />

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirmPostId}
        isClosing={isModalClosing}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeletePost}
      />

      {/* アニメーションスタイル */}
      <Animations />

      {/* トースト通知 */}
      <Toast toasts={toasts} />
    </div>
  )
}

export default App
