import { useState, useEffect, useCallback } from 'react'
import { PostTable } from './components/PostTable/PostTable'
import { Toast } from './components/Toast'
import { useToast } from './hooks/useToast'
import type { Post } from './types'

function App() {
  const { toasts, showToast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const getRecordId = () => {
    try {
      return (window.parent as any).Xrm?.Page?.data?.entity?.getId()?.replace(/[{}]/g, '') || null
    } catch {
      return null
    }
  }

  const getAttachmentId = async (recordId: string) => {
    const xrm = (window.parent as any).Xrm
    const filter = `_proto_wonumber_value eq ${recordId} and (proto_attachmenttype eq 931440001 or proto_attachmenttype eq 931440003)`
    const result = await xrm.WebApi.retrieveMultipleRecords('proto_activitymimeattachment', `?$filter=${filter}&$select=proto_activitymimeattachmentid&$top=1`)
    
    if (result.entities.length > 0) {
      return result.entities[0].proto_activitymimeattachmentid
    }
    
    const created = await xrm.WebApi.createRecord('proto_activitymimeattachment', {
      'proto_wonumber@odata.bind': `/proto_workorders(${recordId})`,
      proto_attachmentname: 'xECM',
      proto_attachmenttype: 931440001
    })
    return created.id || created.proto_activitymimeattachmentid
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const xrm = (window.parent as any).Xrm
    if (!xrm?.WebApi) {
      setLoading(false)
      return
    }

    try {
      const recordId = getRecordId()
      if (!recordId) {
        setPosts([])
        setLoading(false)
        return
      }

      const filter = `_proto_wonumber_value eq ${recordId} and (proto_attachmenttype eq 931440001 or proto_attachmenttype eq 931440003)`
      const attachments = await xrm.WebApi.retrieveMultipleRecords('proto_activitymimeattachment', `?$filter=${filter}&$select=proto_activitymimeattachmentid`)

      const allAnnotations = []
      for (const att of attachments.entities) {
        const anns = await xrm.WebApi.retrieveMultipleRecords('annotation', 
          `?$filter=_objectid_value eq ${att.proto_activitymimeattachmentid}&$select=annotationid,subject,notetext,filename,createdon,modifiedon,stepid&$orderby=createdon desc`)
        allAnnotations.push(...anns.entities)
      }

      setPosts(allAnnotations.map((a: any) => ({
        id: a.annotationid,
        title: a.subject || '',
        content: a.notetext || '',
        changeDate: new Date(a.createdon || Date.now()),
        updateDate: new Date(a.modifiedon || Date.now()),
        memoUser: '',
        userName: '',
        attachmentName: a.filename || '',
        annotationId: a.annotationid,
        stepid: a.stepid ? String(a.stepid) : null
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleAdd = () => {
    const newPost: Post = {
      id: `new-${Date.now()}`,
      title: '',
      content: '',
      changeDate: new Date(),
      updateDate: new Date(),
      memoUser: '',
      userName: '',
      attachmentName: '',
      stepid: null
    }
    setPosts(prev => [newPost, ...prev])
    setEditingId(newPost.id)
  }

  const handleDelete = async (id: string) => {
    const xrm = (window.parent as any).Xrm
    if (!xrm?.WebApi) return
    
    setDeletingId(id)
    try {
      await xrm.WebApi.deleteRecord('annotation', id)
      showToast('レコードを削除しました')
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      showToast('削除に失敗しました', 'info')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSave = async (id: string, title: string, content: string, file: File | null, stepid: string | null) => {
    const xrm = (window.parent as any).Xrm
    if (!xrm?.WebApi) {
      showToast('Xrm.WebApiが利用できません', 'info')
      return false
    }

    if (!title.trim() || !content.trim()) {
      showToast('タイトルとメモ内容を入力してください', 'info')
      return false
    }

    try {
      const recordId = getRecordId()
      if (!recordId) {
        showToast('レコードIDを取得できませんでした', 'info')
        return false
      }

      const isNew = id.startsWith('new-')
      const data: any = { subject: title.trim(), notetext: content.trim() }
      if (stepid) data.stepid = stepid
      else if (!isNew) data.stepid = null

      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve((e.target?.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        data.documentbody = base64
        data.filename = file.name
        data.mimetype = file.type || 'application/pdf'
      } else if (!isNew) {
        data.documentbody = ''
        data.filename = ''
        data.mimetype = ''
      }

      if (isNew) {
        const attachmentId = await getAttachmentId(recordId)
        data['objectid_proto_activitymimeattachment@odata.bind'] = `/proto_activitymimeattachments(${attachmentId})`
        await xrm.WebApi.createRecord('annotation', data)
        showToast('レコードを作成しました')
        setPosts(prev => prev.filter(p => p.id !== id))
      } else {
        await xrm.WebApi.updateRecord('annotation', id, data)
        showToast('レコードを更新しました')
      }
      
      setEditingId(null)
      loadPosts()
      return true
    } catch (err: any) {
      showToast(`エラー: ${err?.message || '保存に失敗しました'}`, 'info')
      return false
    }
  }

  return (
    <div style={{ fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <PostTable
          posts={posts}
          deletingPostId={deletingId}
          editingPostId={editingId}
          onEdit={(post) => setEditingId(post.id)}
          onSaveEdit={handleSave}
          onCancelEdit={() => {
            if (editingId?.startsWith('new-')) {
              setPosts(prev => prev.filter(p => p.id !== editingId))
            }
            setEditingId(null)
          }}
          onDelete={handleDelete}
          showToast={showToast}
          onRefresh={loadPosts}
          onAdd={handleAdd}
          isRefreshing={loading}
        />
      </div>
      <Toast toasts={toasts} />
    </div>
  )
}

export default App
