import { FiCheckCircle } from 'react-icons/fi'
import type { Toast as ToastType } from '../../types'
import './Toast.css'

interface ToastProps {
  toasts: ToastType[]
}

/**
 * トースト通知コンポーネント
 */
export const Toast = ({ toasts }: ToastProps) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type}`}
        >
          <FiCheckCircle size={18} className="toast-icon" />
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
