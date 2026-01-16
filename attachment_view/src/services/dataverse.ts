/**
 * Dataverse API用の汎用サービス
 */

/**
 * Dataverse APIリクエストの基本設定
 */
interface DataverseRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: any
}

/**
 * Dataverse APIへの汎用リクエスト関数
 * @param entityName - エンティティ名（例: 'notes', 'contacts'）
 * @param options - リクエストオプション
 * @returns APIレスポンス
 */
export const dataverseRequest = async <T = any>(
  entityName: string,
  options: DataverseRequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body } = options

  // Xrm.WebApiを使用（Dynamics 365環境）
  if (typeof (window as any).Xrm !== 'undefined' && (window as any).Xrm?.WebApi) {
    const xrm = (window as any).Xrm
    const webApi = xrm.WebApi

    try {
      let response: any

      switch (method) {
        case 'GET':
          // クエリパラメータがある場合
          const query = body ? `?${new URLSearchParams(body).toString()}` : ''
          response = await webApi.retrieveMultipleRecords(entityName, query)
          return response.entities as T

        case 'POST':
          response = await webApi.createRecord(entityName, body)
          return response as T

        case 'PATCH':
          const recordId = body.id || body[`${entityName}id`]
          const updateData = { ...body }
          delete updateData.id
          delete updateData[`${entityName}id`]
          response = await webApi.updateRecord(entityName, recordId, updateData)
          return response as T

        case 'DELETE':
          const deleteId = body.id || body[`${entityName}id`]
          await webApi.deleteRecord(entityName, deleteId)
          return {} as T

        default:
          throw new Error(`Unsupported method: ${method}`)
      }
    } catch (error) {
      console.error(`Dataverse API Error (${method} ${entityName}):`, error)
      throw error
    }
  }

  // 開発環境用のフォールバック（モック）
  return mockDataverseRequest<T>(entityName, method, body)
}

/**
 * 開発環境用のモックリクエスト
 */
const mockDataverseRequest = async <T = any>(
  _entityName: string,
  method: string,
  body?: any
): Promise<T> => {
  // 開発環境でのモック処理
  await new Promise(resolve => setTimeout(resolve, 300))
  
  if (method === 'GET') {
    return [] as T
  }
  if (method === 'POST' || method === 'PATCH') {
    return { id: Date.now().toString(), ...body } as T
  }
  return {} as T
}

/**
 * エンティティレコードを取得（フィルタ付き）
 * @param entityName - エンティティ名
 * @param filter - ODataフィルタ文字列（例: "statuscode eq 1"）
 * @param select - 取得するフィールド（例: ["title", "content"]）
 * @param orderBy - ソート順（例: "createdon desc"）
 * @returns エンティティレコードの配列
 */
export const getEntityRecords = async <T = any>(
  entityName: string,
  filter?: string,
  select?: string[],
  orderBy?: string
): Promise<T[]> => {
  const queryParams: Record<string, string> = {}
  
  if (filter) {
    queryParams['$filter'] = filter
  }
  
  if (select && select.length > 0) {
    queryParams['$select'] = select.join(',')
  }
  
  if (orderBy) {
    queryParams['$orderby'] = orderBy
  }

  return dataverseRequest<T[]>(entityName, {
    method: 'GET',
    body: queryParams
  })
}

/**
 * エンティティレコードを作成
 * @param entityName - エンティティ名
 * @param data - 作成するデータ
 * @returns 作成されたレコード
 */
export const createEntityRecord = async <T = any>(
  entityName: string,
  data: Record<string, any>
): Promise<T> => {
  return dataverseRequest<T>(entityName, {
    method: 'POST',
    body: data
  })
}

/**
 * エンティティレコードを更新
 * @param entityName - エンティティ名
 * @param recordId - レコードID
 * @param data - 更新するデータ
 * @returns 更新されたレコード
 */
export const updateEntityRecord = async <T = any>(
  entityName: string,
  recordId: string,
  data: Record<string, any>
): Promise<T> => {
  return dataverseRequest<T>(entityName, {
    method: 'PATCH',
    body: { id: recordId, ...data }
  })
}

/**
 * エンティティレコードを削除
 * @param entityName - エンティティ名
 * @param recordId - レコードID
 */
export const deleteEntityRecord = async (
  entityName: string,
  recordId: string
): Promise<void> => {
  await dataverseRequest(entityName, {
    method: 'DELETE',
    body: { id: recordId }
  })
}

