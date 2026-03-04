import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import { BaseModal } from '../baseModal'
import { Button } from '../button'
import './DayCopyModal.css'

export type DayCopyModalProps = {
  isOpen: boolean
  onClose: () => void
  onExecute?: (targetDate: string) => void
  sourceDate: Date | null
  sourceEntryCount: number
}

export function DayCopyModal({
  isOpen,
  onClose,
  onExecute,
  sourceDate,
  sourceEntryCount,
}: DayCopyModalProps): JSX.Element {
  const [targetDate, setTargetDate] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTargetDate('')
  }, [isOpen, sourceDate])

  const sourceDateLabel = useMemo(() => {
    if (!sourceDate) return ''
    return new Intl.DateTimeFormat('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).format(sourceDate)
  }, [sourceDate])

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="1日コピー"
      className="day-copy-modal"
      footerButtons={[
        <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
        <Button
          key="execute"
          label="実行"
          disabled={!targetDate}
          onClick={() => onExecute?.(targetDate)}
        />,
      ]}
    >
      <div className="copy-section">
        <div className="copy-section-label">コピー元</div>
        <div className="copy-source-card">
          <FaIcons.FaRegCalendarAlt className="copy-source-icon" />
          <span className="copy-source-date">{sourceDateLabel}</span>
          <span className="copy-source-separator">|</span>
          <span className="copy-source-count">{sourceEntryCount}件</span>
        </div>
      </div>

      <div className="copy-arrow">
        <FaIcons.FaArrowDown />
      </div>

      <div className="copy-section">
        <div className="copy-section-label">
          コピー先
          <span className="copy-required">*</span>
        </div>
        <div className="copy-date-input">
          <input
            ref={inputRef}
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
          />
          <FaIcons.FaRegCalendarAlt
            className="copy-date-icon"
            onClick={() => inputRef.current?.showPicker?.()}
          />
        </div>
      </div>

      <div className="copy-warning">
        <FaIcons.FaExclamationTriangle className="copy-warning-icon" />
        <div>
          <div className="copy-warning-title">上書きに注意</div>
          <div className="copy-warning-text">
            コピー先に同じ日のデータがある場合、重複して登録される可能性があります。
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
