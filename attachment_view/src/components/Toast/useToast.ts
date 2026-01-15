import { useState, useCallback } from 'react'
import type { Toast } from '../../types'
import { TOAST_DURATION } from './constants'

/**
 * トースト通知を管理するカスタムフック
 * @returns トースト配列と表示関数
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  /**
   * トースト通知を表示
   * @param message - 表示するメッセージ
   * @param type - トーストのタイプ（success または info）
   */
  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, TOAST_DURATION)
  }, [])

  return { toasts, showToast }
}
