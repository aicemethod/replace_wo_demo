/**
 * Dynamics 365のCustom Parameterからセクション識別子を取得
 */
const getSectionFromXrm = (): string | null => {
  try {
    if (typeof (window as any).Xrm === 'undefined' || !(window as any).Xrm?.Utility?.getPageContext) {
      return null
    }

    const xrm = (window as any).Xrm as typeof Xrm
    const pageContext = xrm.Utility.getPageContext()
    const input = pageContext.input

    if (!input?.data) return null

    // 文字列（JSON）の場合
    if (typeof input.data === 'string') {
      try {
        const parsed = JSON.parse(input.data)
        return parsed?.section || null
      } catch {
        return null
      }
    }

    // オブジェクトの場合
    if (typeof input.data === 'object' && !Array.isArray(input.data)) {
      const dataObj = input.data as { [key: string]: any }
      return dataObj.section || dataObj.Section || dataObj.SECTION || null
    }

    return null
  } catch {
    return null
  }
}

/**
 * URLパラメータからセクション識別子を取得
 */
const getSectionFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search)
  
  // sectionパラメータが直接指定されている場合
  const sectionParam = params.get('section')
  if (sectionParam) return sectionParam

  // dataパラメータにJSONが含まれている場合
  const dataParam = params.get('data')
  if (!dataParam) return null

  try {
    const decoded = decodeURIComponent(dataParam)
    const parsed = JSON.parse(decoded)
    return parsed?.section || null
  } catch {
    return null
  }
}

/**
 * Dynamics 365のCustom ParameterまたはURLパラメータからセクション識別子を取得
 * @returns セクション識別子（A, B, C, D など）または null
 */
export const getSectionParam = (): string | null => {
  return getSectionFromXrm() || getSectionFromUrl()
}
