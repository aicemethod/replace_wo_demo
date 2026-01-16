/**
 * Dynamics 365のCustom ParameterまたはURLパラメータからセクション識別子を取得
 * @returns セクション識別子（A, B, C, D など）または null
 */
export const getSectionParam = (): string | null => {
  let sectionParam: string | null = null

  // 方法1: Dynamics 365のCustom Parameter（Data）から取得を試行
  try {
    // XrmはDynamics 365環境でのみ利用可能
    if (typeof (window as any).Xrm !== 'undefined' && (window as any).Xrm?.Utility?.getPageContext) {
      const xrm = (window as any).Xrm as typeof Xrm
      const pageContext = xrm.Utility.getPageContext()
      const input = pageContext.input
      
      if (input?.data) {
        // パターン1: input.data が文字列（JSON）の場合
        if (typeof input.data === 'string') {
          try {
            const parsed = JSON.parse(input.data)
            if (parsed && typeof parsed === 'object' && parsed.section) {
              sectionParam = parsed.section
            }
          } catch (parseError) {
            // JSON解析エラーは無視
          }
        }
        // パターン2: input.data がオブジェクトの場合
        else if (typeof input.data === 'object' && !Array.isArray(input.data)) {
          const dataObj = input.data as { [key: string]: any }
          // section プロパティを確認（大文字小文字のバリエーションも）
          sectionParam = dataObj.section || dataObj.Section || dataObj.SECTION || null
        }
      }
    }
  } catch (e) {
    // Xrmが利用できない環境（開発環境など）では無視
  }

  // 方法2: URLパラメータから取得（Custom Parameterが無い場合のフォールバック）
  if (!sectionParam) {
    const params = new URLSearchParams(window.location.search)
    
    // パターン1: sectionパラメータが直接指定されている場合
    sectionParam = params.get('section')
    if (!sectionParam) {
      // パターン2: dataパラメータにJSONが含まれている場合（Dynamics 365のCustom ParameterがURLに変換された場合）
      const dataParam = params.get('data')
      if (dataParam) {
        try {
          // URLデコードしてからJSONパース
          const decoded = decodeURIComponent(dataParam)
          const parsed = JSON.parse(decoded)
          if (parsed && typeof parsed === 'object' && parsed.section) {
            sectionParam = parsed.section
          }
        } catch (parseError) {
          // JSON解析エラーは無視
        }
      }
    }
  }

  return sectionParam
}

