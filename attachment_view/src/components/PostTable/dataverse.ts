/**
 * Dataverse API用の最小実装
 */

const getXrm = () => {
  if (typeof window !== 'undefined' && (window.parent as any).Xrm?.WebApi) {
    return (window.parent as any).Xrm.WebApi
  }
  return null
}

// データ取得
export const getEntityRecords = async (
  entityName: string,
  filter?: string,
  select?: string[],
  orderBy?: string
): Promise<any[]> => {
  const xrm = getXrm()
  if (!xrm) return []

  const params: string[] = []
  if (filter) params.push(`$filter=${filter}`)
  if (select?.length) params.push(`$select=${select.join(',')}`)
  if (orderBy) params.push(`$orderby=${orderBy}`)

  const query = params.length ? `?${params.join('&')}` : ''
  const result = await xrm.retrieveMultipleRecords(entityName, query)
  return result.entities || []
}

// データ作成
export const createEntityRecord = async (entityName: string, data: any): Promise<any> => {
  const xrm = getXrm()
  if (!xrm) throw new Error('Xrm.WebApi not available')
  return await xrm.createRecord(entityName, data)
}

// データ更新
export const updateEntityRecord = async (entityName: string, recordId: string, data: any): Promise<void> => {
  const xrm = getXrm()
  if (!xrm) throw new Error('Xrm.WebApi not available')
  await xrm.updateRecord(entityName, recordId, data)
}

// データ削除
export const deleteEntityRecord = async (entityName: string, recordId: string): Promise<void> => {
  const xrm = getXrm()
  if (!xrm) throw new Error('Xrm.WebApi not available')
  await xrm.deleteRecord(entityName, recordId)
}
