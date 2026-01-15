import { useCallback } from 'react'
import type { Post } from '../types'

interface UseAppHandlersProps {
  annotations: Post[]
  editingAnnotationId: string | null
  editingPostId: string | null
  deletingAnnotationId: string | null
  deletingPostId: string | null
  startEdit: (post: Post) => void
  handleEditAnnotation: (post: Post) => void
  handleSaveAnnotationEdit: (postId: string, title: string, content: string, file: File | null, stepid: string | null) => Promise<boolean>
  saveEdit: (postId: string, title: string, content: string, file: File | null) => Promise<boolean>
  handleCancelAnnotationEdit: () => void
  cancelEdit: () => void
  deleteAnnotation: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}

const isAnnotation = (annotations: Post[], postId: string) => 
  annotations.some(a => a.id === postId)

/**
 * Appコンポーネントのハンドラー関数
 */
export const useAppHandlers = ({
  annotations,
  editingAnnotationId,
  editingPostId,
  deletingAnnotationId,
  deletingPostId,
  startEdit,
  handleEditAnnotation,
  handleSaveAnnotationEdit,
  saveEdit,
  handleCancelAnnotationEdit,
  cancelEdit,
  deleteAnnotation,
  deletePost
}: UseAppHandlersProps) => {
  const handleEdit = useCallback((post: Post) => {
    const isAnnotation = annotations.some(a => a.id === post.id)
    if (isAnnotation) {
      handleEditAnnotation(post)
    } else {
      startEdit(post)
    }
  }, [annotations, handleEditAnnotation, startEdit])

  const handleDelete = useCallback((postId: string) => {
    const isAnnotation = annotations.some(a => a.id === postId)
    if (isAnnotation) {
      deleteAnnotation(postId)
    } else {
      deletePost(postId)
    }
  }, [annotations, deleteAnnotation, deletePost])

  const handleSaveEdit = useCallback((postId: string, title: string, content: string, file: File | null, stepid: string | null) => {
    return isAnnotation(annotations, postId)
      ? handleSaveAnnotationEdit(postId, title, content, file, stepid)
      : saveEdit(postId, title, content, file)
  }, [annotations, handleSaveAnnotationEdit, saveEdit])

  const handleCancelEdit = useCallback(() => {
    if (editingAnnotationId) {
      handleCancelAnnotationEdit()
    } else {
      cancelEdit()
    }
  }, [editingAnnotationId, handleCancelAnnotationEdit, cancelEdit])

  const getDeletingPostId = useCallback((allPosts: Post[]) => {
    return allPosts.find(p => 
      isAnnotation(annotations, p.id) 
        ? deletingAnnotationId === p.id 
        : deletingPostId === p.id
    )?.id || null
  }, [annotations, deletingAnnotationId, deletingPostId])

  const getEditingPostId = useCallback((allPosts: Post[]) => {
    return allPosts.find(p => 
      isAnnotation(annotations, p.id) 
        ? editingAnnotationId === p.id 
        : editingPostId === p.id
    )?.id || null
  }, [annotations, editingAnnotationId, editingPostId])

  return {
    handleEdit,
    handleDelete,
    handleSaveEdit,
    handleCancelEdit,
    getDeletingPostId,
    getEditingPostId
  }
}
