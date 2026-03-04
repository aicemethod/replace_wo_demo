import {
  useCallback,
  useEffect,
  useState,
  type JSX,
  type ReactNode,
} from 'react'
import './BaseModal.css'

type ModalSize = 'small' | 'medium' | 'large'

export type BaseModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footerButtons?: ReactNode | ReactNode[]
  size?: ModalSize
  className?: string
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerButtons,
  size = 'medium',
  className = '',
}: BaseModalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (isOpen) {
      setMounted(true)
      timer = setTimeout(() => setVisible(true), 10)
    } else {
      setVisible(false)
      timer = setTimeout(() => setMounted(false), 200)
    }

    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!mounted) return null

  return (
    <div
      className={`modal-overlay ${visible ? 'fade-in' : 'fade-out'}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal-content ${size} ${visible ? 'fade-in' : 'fade-out'} ${className}`.trim()}
      >
        {(title || description) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {description && <p className="modal-description">{description}</p>}
          </div>
        )}

        <div className="modal-body">{children}</div>

        {footerButtons && (
          <div className="modal-footer">
            {Array.isArray(footerButtons)
              ? footerButtons.map((button, index) => <span key={index}>{button}</span>)
              : footerButtons}
          </div>
        )}
      </div>
    </div>
  )
}
