import type { JSX } from 'react'
import { BaseModal } from '../baseModal'
import { Button } from '../button'
import './ConfirmDeleteModal.css'

export type ConfirmDeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = '削除',
  message = '選択した情報を削除します。',
}: ConfirmDeleteModalProps): JSX.Element {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footerButtons={[
        <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
        <Button key="confirm" label="削除" onClick={onConfirm} className="delete-button" />,
      ]}
    >
      <div className="confirm-delete-body">
        <p>{message}</p>
        <p>削除したデータは復元ができません。</p>
        <p>よろしいですか？</p>
      </div>
    </BaseModal>
  )
}
