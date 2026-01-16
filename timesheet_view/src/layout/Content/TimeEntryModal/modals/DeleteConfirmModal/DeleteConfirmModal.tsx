import '../../TimeEntryModal.css';
import './DeleteConfirmModal.css';
import Button from '../../../../../components/elements/Button';
import Modal from '../../../../../components/elements/Modal';

type DeleteConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

// 削除確認モーダル
function DeleteConfirmModal({ open, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="削除の確認"
      panelClassName="delete-confirm-modal-panel"
      zIndex={90}
      footer={
        <>
          <Button variant="static" color="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="static" color="secondary" onClick={onConfirm}>
            削除
          </Button>
        </>
      }
    >
      <p className="time-entry-modal-description">
        このタイムエントリを削除してもよろしいですか？
        <br />
        この操作は取り消せません。
      </p>
    </Modal>
  );
}

export default DeleteConfirmModal;

