import { FiCheckCircle } from 'react-icons/fi'
import type { Toast as ToastType } from '../types'

interface ToastProps {
  toasts: ToastType[]
}

/**
 * トースト通知コンポーネント
 */
export const Toast = ({ toasts }: ToastProps) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            backgroundColor: toast.type === 'success' ? '#115ea3' : '#666',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '280px',
            maxWidth: '400px',
            fontSize: '14px',
            fontFamily: 'SegoeUI, "Segoe UI", "Helvetica Neue", sans-serif',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'auto'
          }}
        >
          <FiCheckCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
