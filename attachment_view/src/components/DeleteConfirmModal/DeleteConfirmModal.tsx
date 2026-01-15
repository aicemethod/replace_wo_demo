import './DeleteConfirmModal.css'

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
      className={`deleteconfirmmodal-overlay ${isClosing ? 'deleteconfirmmodal-closing' : ''}`}
      onClick={onClose}
    >
      <div
        className={`deleteconfirmmodal-content ${isClosing ? 'deleteconfirmmodal-content-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="deleteconfirmmodal-title">
          メモを削除しますか？
        </h3>
        <p className="deleteconfirmmodal-message">
          この操作は取り消せません。
        </p>
        <div className="deleteconfirmmodal-actions">
          <button
            onClick={onClose}
            className="deleteconfirmmodal-button deleteconfirmmodal-button-cancel"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="deleteconfirmmodal-button deleteconfirmmodal-button-confirm"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
