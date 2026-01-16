import type { ReactNode } from 'react';
import './Modal.css';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  zIndex?: number;
};

// 汎用モーダルコンポーネント
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className = '',
  panelClassName = '',
  bodyClassName = '',
  zIndex = 80,
}: ModalProps) {
  return (
    <div
      className={`modal ${open ? 'open' : 'closed'} ${className}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      style={{ zIndex }}
    >
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div className={`modal-panel ${panelClassName}`}>
        {title && (
          <header className="modal-header">
            {typeof title === 'string' ? <h2>{title}</h2> : title}
          </header>
        )}
        <div className={`modal-body ${bodyClassName}`}>{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export default Modal;

