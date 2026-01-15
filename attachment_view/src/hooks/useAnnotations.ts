import { useState, useEffect, useCallback } from 'react'
import type { Post } from '../types'
import { getSectionParam } from '../utils/sectionParam'
import { SECTION_CONFIGS } from '../config/sections'
import { useToast } from './useToast'

const entityName = 'proto_activitymimeattachment'

/**
 * annotationレコードを管理するカスタムフック
 */
export const useAnnotations = (sectionConfig: any) => {
  const [annotations, setAnnotations] = useState<Post[]>([])
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false)
  const [deletingAnnotationId, setDeletingAnnotationId] = useState<string | null>(null)
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null)
  const [newPostId, setNewPostId] = useState<string | null>(null)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const { showToast } = useToast()

  // annotationレコードを取得
  const loadAnnotations = useCallback(async () => {
    setIsLoadingAnnotations(true)
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      try {
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

        const currentSection = getSectionParam()
        const sectionCategoryMap: { [key: string]: number } = {
          'A': 931440000,
          'B': 931440001,
          'C': 931440002,
          'D': 931440003
        }
        const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

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
        
        let userName = 'ユーザー'
        try {
          const xrm = (window.parent as any).Xrm
          if (xrm?.Utility?.getGlobalContext?.()?.userSettings) {
            userName = xrm.Utility.getGlobalContext().userSettings.userName || 'ユーザー'
          }
        } catch (err) {
          // エラー時はデフォルト値を使用
        }

        const creatorIds = new Set<string>()
        allAnnotations.forEach((annotation: any) => {
          const creatorId = annotation._createdby_value
          if (creatorId) {
            creatorIds.add(creatorId)
          }
        })

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

  // 初期読み込み
  useEffect(() => {
    if (sectionConfig && !hasInitialLoad) {
      setHasInitialLoad(true)
      loadAnnotations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionConfig])

  // 新規行を追加
  const handleAddNewRow = useCallback(() => {
    const tempId = `new-${Date.now()}`
    setNewPostId(tempId)
    
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
    
    setAnnotations(prev => [newPost, ...prev])
    setEditingAnnotationId(tempId)
  }, [])

  // 編集を開始
  const handleEditAnnotation = useCallback((post: Post) => {
    setEditingAnnotationId(post.id)
  }, [])

  // 編集をキャンセル
  const handleCancelAnnotationEdit = useCallback(() => {
    if (newPostId && editingAnnotationId === newPostId) {
      setAnnotations(prev => prev.filter(a => a.id !== newPostId))
      setNewPostId(null)
    }
    setEditingAnnotationId(null)
  }, [newPostId, editingAnnotationId])

  // モーダル経由で保存
  const saveAnnotationViaModal = useCallback(async (editingPost: Post | null, title: string, content: string, file: File | null): Promise<boolean> => {
    if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
      showToast('Xrm.WebApiが利用できません', 'info')
      return false
    }

    try {
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

      const currentSection = getSectionParam()
      const sectionCategoryMap: { [key: string]: number } = {
        'A': 931440000,
        'B': 931440001,
        'C': 931440002,
        'D': 931440003
      }
      const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

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

      if (editingPost) {
        const updateData: any = {
          subject: title.trim(),
          notetext: content.trim()
        }

        if (file) {
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
          updateData.documentbody = ''
          updateData.filename = ''
          updateData.mimetype = ''
        }

        await (window.parent as any).Xrm.WebApi.updateRecord('annotation', editingPost.id, updateData)
        showToast('レコードを更新しました')
      } else {
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
      return true
    } catch (err: any) {
      console.error(err)
      const errorMessage = err?.message || err?.raw || '保存に失敗しました'
      showToast(`エラー: ${errorMessage}`, 'info')
      return false
    }
  }, [showToast, loadAnnotations])

  // インライン編集を保存
  const handleSaveAnnotationEdit = useCallback(async (postId: string, title: string, content: string, file: File | null, stepid: string | null): Promise<boolean> => {
    if (typeof (window.parent as any).Xrm === 'undefined' || !(window.parent as any).Xrm?.WebApi) {
      showToast('Xrm.WebApiが利用できません', 'info')
      return false
    }

    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください。', 'info')
      return false
    }

    try {
      const isNew = postId.startsWith('new-')
      
      if (isNew) {
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

        const currentSection = getSectionParam()
        const sectionCategoryMap: { [key: string]: number } = {
          'A': 931440000,
          'B': 931440001,
          'C': 931440002,
          'D': 931440003
        }
        const targetCategory = currentSection ? sectionCategoryMap[currentSection] : null

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
        
        setAnnotations(prev => prev.filter(a => a.id !== postId))
        setNewPostId(null)
        setEditingAnnotationId(null)
        loadAnnotations()
        return true
      }

      const updateData: any = {
        subject: title.trim(),
        notetext: content.trim()
      }

      if (stepid !== null && stepid !== undefined && stepid !== '') {
        updateData.stepid = stepid
      } else {
        updateData.stepid = null
      }

      if (file) {
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
  }, [showToast, loadAnnotations])

  // 削除
  const deleteAnnotation = useCallback(async (postId: string): Promise<void> => {
    if (typeof (window.parent as any).Xrm !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
      setDeletingAnnotationId(postId)
      try {
        await (window.parent as any).Xrm.WebApi.deleteRecord('annotation', postId)
        showToast('レコードを削除しました')
        setTimeout(() => {
          setAnnotations(prev => prev.filter(a => a.id !== postId))
          setDeletingAnnotationId(null)
        }, 300)
      } catch (err: any) {
        console.error(err)
        showToast('削除に失敗しました', 'info')
        setDeletingAnnotationId(null)
        throw err
      }
    }
  }, [showToast])

  return {
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
  }
}
