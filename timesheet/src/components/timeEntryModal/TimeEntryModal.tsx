import { useEffect, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import { BaseModal } from '../baseModal'
import { Button } from '../button'
import { ConfirmDeleteModal } from '../confirmDeleteModal'
import { ResourceSelectModal } from '../resourceSelectModal'
import './TimeEntryModal.css'

type Option = {
  value: string
  label: string
}

export type TimeEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: Record<string, string>) => void
  onDelete?: () => void
  selectedDateTime?: { start: Date; end: Date } | null
  woOptions?: Option[]
  resources?: { id: string; number?: string; name?: string }[]
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function TimeEntryModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  selectedDateTime,
  woOptions = [],
  resources = [],
}: TimeEntryModalProps): JSX.Element {
  const [wo, setWo] = useState('')
  const [comment, setComment] = useState('')
  const [resourceText, setResourceText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setWo('')
    setComment('')
    setResourceText('')
    setStartDate(selectedDateTime ? formatDate(selectedDateTime.start) : '')
    setEndDate(selectedDateTime ? formatDate(selectedDateTime.end) : '')
  }, [isOpen, selectedDateTime])

  const handleSubmit = () => {
    onSubmit?.({
      wo,
      comment,
      resource: resourceText,
      startDate,
      endDate,
    })
    onClose()
  }

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="新しいタイムエントリを作成"
        description="Time entry の基本情報を入力して作成を押してください。"
        size="large"
        footerButtons={[
          <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
          <Button
            key="delete"
            label="削除"
            color="secondary"
            onClick={() => setIsDeleteModalOpen(true)}
          />,
          <Button key="save" label="作成" onClick={handleSubmit} />,
        ]}
      >
        <div className="time-entry-grid">
          <label className="field">
            <span>WO番号</span>
            <select value={wo} onChange={(event) => setWo(event.target.value)}>
              <option value="">選択してください</option>
              {woOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>リソース</span>
            <button
              type="button"
              className="resource-open-button"
              onClick={() => setIsResourceModalOpen(true)}
            >
              <span>{resourceText || 'リソース選択'}</span>
              <FaIcons.FaUsers />
            </button>
          </label>

          <label className="field">
            <span>開始日</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>

          <label className="field">
            <span>終了日</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>

          <label className="field field-full">
            <span>コメント</span>
            <textarea
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="コメントを入力"
            />
          </label>
        </div>
      </BaseModal>

      <ResourceSelectModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        resources={resources}
        onSave={(selected) => setResourceText(selected.map((item) => item.label).join('\n'))}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete?.()
          setIsDeleteModalOpen(false)
          onClose()
        }}
      />
    </>
  )
}
