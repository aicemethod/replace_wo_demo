import type { FieldMapping } from './mapper'

export interface SectionConfig {
  entityName: string
  filter: string
  selectFields: string[]
  orderBy: string
  fieldMapping: FieldMapping
  createStatusCode: number
  updateStatusCode?: number
}

// セクション設定（実際の値に置き換える）
export const getSectionConfig = (sectionId: string | null): SectionConfig | null => {
  if (!sectionId) return null
  
  // 簡略化: セクションAの設定のみ（必要に応じて拡張）
  return {
    entityName: 'annotation', // 実際のエンティティ名
    filter: 'statecode eq 0',
    selectFields: ['annotationid', 'subject', 'notetext', 'createdon', 'modifiedon', 'filename', 'stepid', 'new_hasreportoutput'],
    orderBy: 'createdon desc',
    fieldMapping: {
      id: 'annotationid',
      title: 'subject',
      content: 'notetext',
      changeDate: 'createdon',
      updateDate: 'modifiedon',
      attachmentName: 'filename',
      stepid: 'stepid',
      hasReportOutput: 'new_hasreportoutput'
    },
    createStatusCode: 1,
    updateStatusCode: 1
  }
}

// セクションIDを取得（Dynamics 365のCustom ParameterまたはURLパラメータから）
export const getSectionParam = (): string | null => {
  // 方法1: Dynamics 365のCustom Parameterから取得
  try {
    if (typeof (window as any).Xrm !== 'undefined' && (window as any).Xrm?.Utility?.getPageContext) {
      const xrm = (window as any).Xrm
      const pageContext = xrm.Utility.getPageContext()
      const input = pageContext.input
      
      if (input?.data) {
        if (typeof input.data === 'string') {
          try {
            const parsed = JSON.parse(input.data)
            if (parsed?.section) return parsed.section
          } catch {}
        } else if (typeof input.data === 'object') {
          return input.data.section || input.data.Section || input.data.SECTION || null
        }
      }
    }
  } catch {}

  // 方法2: URLパラメータから取得
  const params = new URLSearchParams(window.location.search)
  const section = params.get('section')
  if (section) return section

  const dataParam = params.get('data')
  if (dataParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(dataParam))
      if (parsed?.section) return parsed.section
    } catch {}
  }

  return null
}
