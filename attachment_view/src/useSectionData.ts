import { useState, useEffect } from 'react'
import type { SectionData } from './types'
import { getSectionParam } from './utils/sectionParam/index'
import { getSectionConfig } from './components/PostTable/sections'

/**
 * セクションデータを管理するカスタムフック
 * @returns セクションデータとセクション設定
 */
export const useSectionData = () => {
  const [sectionData, setSectionData] = useState<SectionData | null>(null)
  const [sectionConfig, setSectionConfig] = useState<ReturnType<typeof getSectionConfig>>(null)

  useEffect(() => {
    const sectionParam = getSectionParam()
    const config = getSectionConfig(sectionParam)
    setSectionConfig(config)

    // セクション設定から表示用データを生成
    if (config) {
      setSectionData({
        title: config.displayTitle,
        content: `${config.displayTitle}に表示されるコンテンツです。`,
        changeDate: new Date(),
        updateDate: new Date(),
        memoUser: 'メモの更新者',
        userName: 'ユーザー名',
        attachmentName: ''
      })
    } else {
      setSectionData({
        title: 'デフォルトのタイトル',
        content: 'セクションが指定されていません。URLパラメータに?section=A|B|C|Dを追加してください。',
        changeDate: new Date(),
        updateDate: new Date(),
        memoUser: 'メモの更新者',
        userName: 'ユーザー名',
        attachmentName: ''
      })
    }
  }, [])

  return { sectionData, sectionConfig }
}
