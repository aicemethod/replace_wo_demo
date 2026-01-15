import { useSectionData } from '../useSectionData'
import { usePosts, useAnnotations, PostTable } from '../components/PostTable'
import { Toast } from '../components/Toast'
import { Animations } from '../components/Animations'
import { useAppHandlers } from './useAppHandlers'
import './App.css'

/**
 * メインアプリケーションコンポーネント
 */
function App() {
    const { sectionData, sectionConfig } = useSectionData()

    const {
        filteredPosts,
        deletingPostId,
        editingPostId,
        isLoading,
        startEdit,
        cancelEdit,
        saveEdit,
        deletePost,
        showToast,
        toasts,
        loadPosts
    } = usePosts(sectionData, sectionConfig)

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
        deleteAnnotation
    } = useAnnotations(sectionConfig)

    const handlers = useAppHandlers({
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
    })

    const handleRefresh = () => Promise.all([loadPosts(), loadAnnotations()])

    if (!sectionData) {
        return <div className="app-loading">読み込み中...</div>
    }

    const allPosts = [...annotations, ...filteredPosts]

    return (
        <div className="app-container">
            <div className="app-content">
                <PostTable
                    posts={allPosts}
                    deletingPostId={handlers.getDeletingPostId(allPosts)}
                    editingPostId={handlers.getEditingPostId(allPosts)}
                    onEdit={handlers.handleEdit}
                    onSaveEdit={handlers.handleSaveEdit}
                    onCancelEdit={handlers.handleCancelEdit}
                    onDelete={handlers.handleDelete}
                    showToast={showToast}
                    onRefresh={handleRefresh}
                    onAdd={handleAddNewRow}
                    isRefreshing={isLoading || isLoadingAnnotations}
                />
            </div>

            <Animations />
            <Toast toasts={toasts} />
        </div>
    )
}

export default App
