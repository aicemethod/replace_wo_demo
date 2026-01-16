interface DeleteConfirmModalProps {
  isOpen: boolean
  isClosing: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * 削除確認モーダルコンポーネント
 */
export const DeleteConfirmModal = ({ isOpen, isClosing, onClose, onConfirm }: DeleteConfirmModalProps) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        animation: isClosing ? 'fadeOut 0.3s ease-in forwards' : 'fadeIn 0.3s ease-out',
        backdropFilter: 'blur(2px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          animation: isClosing 
            ? 'modalSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          margin: '0 0 16px 0'
        }}>
          メモを削除しますか？
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0 0 24px 0',
          lineHeight: '1.6'
        }}>
          この操作は取り消せません。
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#fff',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#dc3545',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}

