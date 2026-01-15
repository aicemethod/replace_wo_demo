import { useState, useEffect, useCallback } from 'react'
import { useSectionData } from './hooks/useSectionData'
import { usePosts } from './hooks/usePosts'
import { PostTable } from './components/PostTable'
import { MemoModal } from './components/MemoModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { Toast } from './components/Toast'
import { Animations } from './components/Animations'
import { getSectionParam } from './utils/sectionParam'
import { SECTION_CONFIGS } from './config/sections'
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
    // copyContent,
    showToast,
    toasts,
    loadPosts
  } = usePosts(sectionData, sectionConfig)

  // annotationレコード管理
  const [annotations, setAnnotations] = useState<Post[]>([])
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false)
  const [deletingAnnotationId, setDeletingAnnotationId] = useState<string | null>(null)
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null)
  const [newPostId, setNewPostId] = useState<string | null>(null) // 新規追加中の一時ID
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const entityName = 'proto_activitymimeattachment'

  // annotationレコードを取得
  const loadAnnotations = useCallback(async () => {
    setIsLoadingAnnotations(true)
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      try {
        // 現在開いているフォームのレコードIDを取得
        let currentRecordId: string | null = null
        try {
          const xrm = (window.parent as any).Xrm
          if (xrm?.Page?.data?.entity?.getId) {
            currentRecordId = xrm.Page.data.entity.getId().replace(/[{}]/g, '')
          }
        } catch (err) {
          console.error('Failed to get current record ID:', err)
        }

        if (!currentRecordId) {
          setAnnotations([])
          setIsLoadingAnnotations(false)
          return
        }

        // 現在のセクションを取得
        const currentSection = getSectionParam()
        
        // セクションとproto_attachmenttypeのマッピング
        const sectionCategoryMap: { [key: string]: number } = {
          'A': 931440000,
          'B': 931440001,
          'C': 931440002,
          'D': 931440003
        }

        // 現在のセクションに対応するproto_attachmenttypeの値を取得
        const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

        // proto_activitymimeattachmentレコードを取得（proto_wonumberでフィルタリング、proto_attachmenttypeも含める）
        let filterQuery = `_proto_wonumber_value eq ${currentRecordId}`
        if (targetCategory !== null) {
          filterQuery += ` and proto_attachmenttype eq ${targetCategory}`
        }

        const testAttachmentResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
          entityName,
          `?$filter=${filterQuery}&$select=proto_activitymimeattachmentid,proto_attachmenttype`
        )

        if (testAttachmentResult.entities.length === 0) {
          setAnnotations([])
          setIsLoadingAnnotations(false)
          return
        }

        // セクションに応じてフィルタリング（念のため）
        const filteredTestAttachments = targetCategory
          ? testAttachmentResult.entities.filter((record: any) => {
              const category = record.proto_attachmenttype
              return category === targetCategory
            })
          : testAttachmentResult.entities

        const annotationPromises = filteredTestAttachments.map(async (record: any) => {
          const recordId = record.proto_activitymimeattachmentid || record.id
          try {
            const annotationResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
              'annotation',
              `?$filter=_objectid_value eq ${recordId}&$select=annotationid,subject,notetext,filename,createdon,modifiedon,_objectid_value,_createdby_value,_modifiedby_value,stepid&$orderby=createdon desc`
            )
            return annotationResult.entities
          } catch (err) {
            console.error(`Failed to fetch annotations for ${recordId}:`, err)
            return []
          }
        })

        const annotationArrays = await Promise.all(annotationPromises)
        const allAnnotations = annotationArrays.flat()
        
        // 現在のユーザー名を取得（最新の値を取得）
        let userName = 'ユーザー'
        try {
          const xrm = (window.parent as any).Xrm
          if (xrm?.Utility?.getGlobalContext?.()?.userSettings) {
            userName = xrm.Utility.getGlobalContext().userSettings.userName || 'ユーザー'
          }
        } catch (err) {
          // エラー時はデフォルト値を使用
        }

        // すべてのユニークな作成者IDを収集
        const creatorIds = new Set<string>()
        allAnnotations.forEach((annotation: any) => {
          const creatorId = annotation._createdby_value
          if (creatorId) {
            creatorIds.add(creatorId)
          }
        })

        // 作成者IDからユーザー名を取得
        const creatorNameMap = new Map<string, string>()
        if (creatorIds.size > 0) {
          try {
            const creatorIdArray = Array.from(creatorIds)
            const creatorPromises = creatorIdArray.map(async (creatorId: string) => {
              try {
                const userRecord = await (window.parent as any).Xrm.WebApi.retrieveRecord(
                  'systemuser',
                  creatorId,
                  '?$select=fullname'
                )
                return { id: creatorId, name: userRecord.fullname || 'ユーザー' }
              } catch (err) {
                console.error(`Failed to get creator name for ${creatorId}:`, err)
                return { id: creatorId, name: 'ユーザー' }
              }
            })
            const creatorResults = await Promise.all(creatorPromises)
            creatorResults.forEach(result => {
              creatorNameMap.set(result.id, result.name)
            })
          } catch (err) {
            console.error('Failed to get creator names:', err)
          }
        }

        // annotationレコードをPost型に変換
        const annotationPosts: Post[] = allAnnotations.map((annotation: any) => {
          
          return {
            id: annotation.annotationid || annotation.id,
            title: annotation.subject || '',
            content: annotation.notetext || '',
            changeDate: annotation.createdon ? new Date(annotation.createdon) : new Date(),
            updateDate: annotation.modifiedon ? new Date(annotation.modifiedon) : new Date(),
            memoUser: 'メモの更新者',
            userName: userName,
            attachmentName: annotation.filename || '',
            annotationId: annotation.annotationid || annotation.id,
            userId: annotation._modifiedby_value || annotation._createdby_value || null,
            stepid: annotation.stepid !== null && annotation.stepid !== undefined ? String(annotation.stepid) : null
          }
        })

        setAnnotations(annotationPosts)
        setIsLoadingAnnotations(false)
      } catch (err: any) {
        console.error(err)
        setIsLoadingAnnotations(false)
      }
    } else {
      setIsLoadingAnnotations(false)
    }
  }, [])

  // 初期読み込み（セクション設定が読み込まれた時のみ、1回だけ）
  useEffect(() => {
    if (sectionConfig && !hasInitialLoad) {
      setHasInitialLoad(true)
      loadAnnotations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionConfig])

  // モーダル状態管理
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false)
  const [isMemoModalClosing, setIsMemoModalClosing] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isAnnotationMode, setIsAnnotationMode] = useState(false)

  // 新規行を追加（テーブル内で編集）
  const handleAddNewRow = () => {
    // 一時的なIDを生成
    const tempId = `new-${Date.now()}`
    setNewPostId(tempId)
    
    // 新しい空のPostオブジェクトを作成
    const newPost: Post = {
      id: tempId,
      title: '',
      content: '',
      changeDate: new Date(),
      updateDate: new Date(),
      memoUser: 'メモの更新者',
      userName: 'ユーザー',
      attachmentName: '',
      annotationId: undefined,
      userId: null,
      stepid: null
    }
    
    // annotationsに追加（先頭に）
    setAnnotations(prev => [newPost, ...prev])
    
    // 編集モードにする
    setEditingAnnotationId(tempId)
  }

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
      // annotationレコードの作成・更新
      if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
        showToast('Xrm.WebApiが利用できません', 'info')
        return false
      }

      try {
        // 現在開いているフォームのレコードIDを取得
        let currentRecordId: string | null = null
        try {
          const xrm = (window.parent as any).Xrm
          if (xrm?.Page?.data?.entity?.getId) {
            currentRecordId = xrm.Page.data.entity.getId().replace(/[{}]/g, '')
          }
        } catch (err) {
          console.error('Failed to get current record ID:', err)
        }

        if (!currentRecordId) {
          showToast('現在のフォームのレコードIDを取得できませんでした', 'info')
          return false
        }

        // 現在のセクションを取得
        const currentSection = getSectionParam()
        const sectionCategoryMap: { [key: string]: number } = {
          'A': 931440000,
          'B': 931440001,
          'C': 931440002,
          'D': 931440003
        }
        const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

        // proto_activitymimeattachmentレコードを取得（proto_wonumberでフィルタリング）
        let filterQuery = `_proto_wonumber_value eq ${currentRecordId}`
        if (targetCategory !== null) {
          filterQuery += ` and proto_attachmenttype eq ${targetCategory}`
        }

        const testAttachmentResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
          entityName,
          `?$filter=${filterQuery}&$select=proto_activitymimeattachmentid&$top=1`
        )

        let testAttachmentId: string

        if (testAttachmentResult.entities.length === 0) {
          // proto_activitymimeattachmentレコードが存在しない場合は作成
          
          // 選択肢のラベル名を取得（セクションのdisplayTitleを使用）
          let categoryLabel = ''
          if (currentSection && SECTION_CONFIGS[currentSection]) {
            categoryLabel = SECTION_CONFIGS[currentSection].displayTitle
          }
          
          // proto_workorderのラベル名を取得
          let workOrderLabel = ''
          try {
            const workOrderRecord = await (window.parent as any).Xrm.WebApi.retrieveRecord(
              'proto_workorder',
              currentRecordId,
              '?$select=proto_wonumber,proto_wotitle'
            )

            workOrderLabel = workOrderRecord.proto_wotitle || ''
          } catch (err) {
            console.error('Failed to get work order label:', err)
            // エラー時はIDを使用
            workOrderLabel = 'WO名未設定'
          }
          
          // 名前を設定（選択肢のラベル名_proto_wonumberのラベル名）
          const attachmentName = categoryLabel && workOrderLabel 
            ? `${categoryLabel}_${workOrderLabel}`
            : workOrderLabel || categoryLabel || 'proto_activitymimeattachment'
          
          const createAttachmentData: any = {
            'proto_wonumber@odata.bind': `/proto_workorders(${currentRecordId})`,
            proto_attachmentname: attachmentName
          }
          
          if (targetCategory !== null) {
            createAttachmentData.proto_attachmenttype = targetCategory
          }

          const createdAttachment = await (window.parent as any).Xrm.WebApi.createRecord(
            entityName,
            createAttachmentData
          )
          testAttachmentId = createdAttachment.id || createdAttachment.proto_activitymimeattachmentid
        } else {
          testAttachmentId = testAttachmentResult.entities[0].proto_activitymimeattachmentid || testAttachmentResult.entities[0].id
        }

        if (editingPost) {
          // 更新
          const updateData: any = {
            subject: title.trim(),
            notetext: content.trim()
          }

          if (file) {
            // 新しいファイルをアップロード
            const reader = new FileReader()
            await new Promise<void>((resolve, reject) => {
              reader.onload = async (e) => {
                try {
                  const base64 = (e.target?.result as string).split(',')[1]
                  updateData.documentbody = base64
                  updateData.filename = file.name
                  updateData.mimetype = file.type || 'application/pdf'
                  resolve()
                } catch (err) {
                  reject(err)
                }
              }
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          } else {
            // ファイルがnullの場合、既存のファイルを削除
            // Dataverseでは、documentbodyを空文字列に設定することで削除できる
            updateData.documentbody = ''
            updateData.filename = ''
            updateData.mimetype = ''
          }

          await (window.parent as any).Xrm.WebApi.updateRecord('annotation', editingPost.id, updateData)
          showToast('レコードを更新しました')
        } else {
          // 新規作成
          const annotationData: any = {
            subject: title.trim(),
            notetext: content.trim(),
            'objectid_proto_activitymimeattachment@odata.bind': `/proto_activitymimeattachments(${testAttachmentId})`
          }

          if (file) {
            const reader = new FileReader()
            await new Promise<void>((resolve, reject) => {
              reader.onload = async (e) => {
                try {
                  const base64 = (e.target?.result as string).split(',')[1]
                  annotationData.documentbody = base64
                  annotationData.filename = file.name
                  annotationData.mimetype = file.type || 'application/pdf'
                  resolve()
                } catch (err) {
                  reject(err)
                }
              }
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
          }

          await (window.parent as any).Xrm.WebApi.createRecord('annotation', annotationData)
          showToast('レコードを作成しました')
        }

        loadAnnotations()
        setIsAnnotationMode(false)
        return true
      } catch (err: any) {
        console.error(err)
        const errorMessage = err?.message || err?.raw || '保存に失敗しました'
        showToast(`エラー: ${errorMessage}`, 'info')
        return false
      }
    } else {
      // 通常の投稿
      if (editingPost) {
        // 編集
        return await updatePost(editingPost.id, title, content, file)
      } else {
        // 新規投稿
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
  const handleDeletePost = () => {
    if (deleteConfirmPostId) {
      // annotationレコードかどうか判定
      const isAnnotation = annotations.some(a => a.id === deleteConfirmPostId)
      
      if (isAnnotation) {
        // annotationレコードを削除
        if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
          setDeletingAnnotationId(deleteConfirmPostId)
          ;(window.parent as any).Xrm.WebApi.deleteRecord('annotation', deleteConfirmPostId)
            .then(() => {
              showToast('レコードを削除しました')
              setTimeout(() => {
                setAnnotations(prev => prev.filter(a => a.id !== deleteConfirmPostId))
                setDeletingAnnotationId(null)
                closeDeleteConfirm()
              }, 300)
            })
            .catch((err: any) => {
              console.error(err)
              showToast('削除に失敗しました', 'info')
              setDeletingAnnotationId(null)
            })
        }
      } else {
        // 通常の投稿を削除
        deletePost(deleteConfirmPostId)
        closeDeleteConfirm()
      }
    }
  }

  // annotationレコードの編集を開始
  const handleEditAnnotation = (post: Post) => {
    setEditingAnnotationId(post.id)
  }

  // annotationレコードの編集をキャンセル
  const handleCancelAnnotationEdit = () => {
    // 新規追加中の行の場合は削除
    if (newPostId && editingAnnotationId === newPostId) {
      setAnnotations(prev => prev.filter(a => a.id !== newPostId))
      setNewPostId(null)
    }
    setEditingAnnotationId(null)
  }

  // annotationレコードの編集を保存
  const handleSaveAnnotationEdit = async (postId: string, title: string, content: string, file: File | null, stepid: string | null): Promise<boolean> => {
    if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
      showToast('Xrm.WebApiが利用できません', 'info')
      return false
    }

    // タイトルと内容のバリデーション
    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください。', 'info')
      return false
    }

    try {
      // 新規作成か更新かを判定
      const isNew = postId.startsWith('new-')
      
      if (isNew) {
        // 新規作成
        // 現在開いているフォームのレコードIDを取得
        let currentRecordId: string | null = null
        try {
          const xrm = (window.parent as any).Xrm
          if (xrm?.Page?.data?.entity?.getId) {
            currentRecordId = xrm.Page.data.entity.getId().replace(/[{}]/g, '')
          }
        } catch (err) {
          console.error('Failed to get current record ID:', err)
        }

        if (!currentRecordId) {
          showToast('現在のフォームのレコードIDを取得できませんでした', 'info')
          return false
        }

        // 現在のセクションを取得
        const currentSection = getSectionParam()
        const sectionCategoryMap: { [key: string]: number } = {
          'A': 931440000,
          'B': 931440001,
          'C': 931440002,
          'D': 931440003
        }
        const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

        // proto_activitymimeattachmentレコードを取得
        let filterQuery = `_proto_wonumber_value eq ${currentRecordId}`
        if (targetCategory !== null) {
          filterQuery += ` and proto_attachmenttype eq ${targetCategory}`
        }

        const testAttachmentResult = await (window.parent as any).Xrm.WebApi.retrieveMultipleRecords(
          entityName,
          `?$filter=${filterQuery}&$select=proto_activitymimeattachmentid&$top=1`
        )

        let testAttachmentId: string

        if (testAttachmentResult.entities.length === 0) {
          // proto_activitymimeattachmentレコードが存在しない場合は作成
          let categoryLabel = ''
          if (currentSection && SECTION_CONFIGS[currentSection]) {
            categoryLabel = SECTION_CONFIGS[currentSection].displayTitle
          }
          
          let workOrderLabel = ''
          try {
            const workOrderRecord = await (window.parent as any).Xrm.WebApi.retrieveRecord(
              'proto_workorder',
              currentRecordId,
              '?$select=proto_wonumber,proto_wotitle'
            )
            workOrderLabel = workOrderRecord.proto_wotitle || ''
          } catch (err) {
            console.error('Failed to get work order label:', err)
            workOrderLabel = 'WO名未設定'
          }
          
          const attachmentName = categoryLabel && workOrderLabel 
            ? `${categoryLabel}_${workOrderLabel}`
            : workOrderLabel || categoryLabel || 'proto_activitymimeattachment'
          
          const createAttachmentData: any = {
            'proto_wonumber@odata.bind': `/proto_workorders(${currentRecordId})`,
            proto_attachmentname: attachmentName
          }
          
          if (targetCategory !== null) {
            createAttachmentData.proto_attachmenttype = targetCategory
          }

          const createdAttachment = await (window.parent as any).Xrm.WebApi.createRecord(
            entityName,
            createAttachmentData
          )
          testAttachmentId = createdAttachment.id || createdAttachment.proto_activitymimeattachmentid
        } else {
          testAttachmentId = testAttachmentResult.entities[0].proto_activitymimeattachmentid || testAttachmentResult.entities[0].id
        }

        // annotationレコードを作成
        const annotationData: any = {
          subject: title.trim(),
          notetext: content.trim(),
          'objectid_proto_activitymimeattachment@odata.bind': `/proto_activitymimeattachments(${testAttachmentId})`
        }

        if (stepid !== null && stepid !== undefined && stepid !== '') {
          annotationData.stepid = stepid
        }

        if (file) {
          const reader = new FileReader()
          await new Promise<void>((resolve, reject) => {
            reader.onload = async (e) => {
              try {
                const base64 = (e.target?.result as string).split(',')[1]
                annotationData.documentbody = base64
                annotationData.filename = file.name
                annotationData.mimetype = file.type || 'application/pdf'
                resolve()
              } catch (err) {
                reject(err)
              }
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        }

        await (window.parent as any).Xrm.WebApi.createRecord('annotation', annotationData)
        showToast('レコードを作成しました')
        
        // 一時的な行を削除
        setAnnotations(prev => prev.filter(a => a.id !== postId))
        setNewPostId(null)
        setEditingAnnotationId(null)
        loadAnnotations()
        return true
      }

      // 更新処理
      const updateData: any = {
        subject: title.trim(),
        notetext: content.trim()
      }

      // stepidの設定（ドロップダウンで既に重複チェック済みなので、そのまま設定）
      if (stepid !== null && stepid !== undefined && stepid !== '') {
        updateData.stepid = stepid
      } else {
        // stepidがnullの場合は、フィールドをクリア（nullに設定）
        updateData.stepid = null
      }

      if (file) {
        // 新しいファイルをアップロード
        const reader = new FileReader()
        await new Promise<void>((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const base64 = (e.target?.result as string).split(',')[1]
              updateData.documentbody = base64
              updateData.filename = file.name
              updateData.mimetype = file.type || 'application/pdf'
              resolve()
            } catch (err) {
              reject(err)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      } else {
        // ファイルがnullの場合、既存のファイルを削除
        // Dataverseでは、documentbodyを空文字列に設定することで削除できる
        updateData.documentbody = ''
        updateData.filename = ''
        updateData.mimetype = ''
      }

      await (window.parent as any).Xrm.WebApi.updateRecord('annotation', postId, updateData)
      showToast('レコードを更新しました')
      setEditingAnnotationId(null)
      loadAnnotations()
      return true
    } catch (err: any) {
      console.error(err)
      const errorMessage = err?.message || err?.raw || '保存に失敗しました'
      showToast(`エラー: ${errorMessage}`, 'info')
      return false
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
