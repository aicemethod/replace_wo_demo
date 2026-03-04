import { useMemo, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import { BaseModal } from '../baseModal'
import { Button } from '../button'
import './ResourceSelectModal.css'

type ResourceItem = {
  id: string
  number?: string
  name?: string
}

export type ResourceSelectModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave?: (selectedResources: { id: string; label: string }[]) => void
  resources?: ResourceItem[]
}

export function ResourceSelectModal({
  isOpen,
  onClose,
  onSave,
  resources = [],
}: ResourceSelectModalProps): JSX.Element {
  const [searchType, setSearchType] = useState<'name' | 'number'>('name')
  const [keyword, setKeyword] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [sortByNumberAsc, setSortByNumberAsc] = useState(true)
  const [sortByNameAsc, setSortByNameAsc] = useState(true)

  const displayUsers = useMemo(() => {
    const filtered =
      searchType === 'name'
        ? resources.filter((user) => (user.name ?? '').includes(keyword))
        : resources.filter((user) => (user.number ?? '').includes(keyword))

    return [...filtered]
      .sort((a, b) =>
        sortByNumberAsc
          ? (a.number ?? '').localeCompare(b.number ?? '')
          : (b.number ?? '').localeCompare(a.number ?? '')
      )
      .sort((a, b) =>
        sortByNameAsc
          ? (a.name ?? '').localeCompare(b.name ?? '')
          : (b.name ?? '').localeCompare(a.name ?? '')
      )
  }, [keyword, resources, searchType, sortByNameAsc, sortByNumberAsc])

  const handleSave = () => {
    onSave?.(
      displayUsers
        .filter((user) => selectedUsers.includes(user.id))
        .map((user) => ({
          id: user.id,
          label: `${user.number ?? '不明'} ${user.name ?? '名称未設定'}`,
        }))
    )
    onClose()
  }

  const toggleSelect = (id: string) => {
    setSelectedUsers((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    )
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="リソース選択"
      size="medium"
      footerButtons={[
        <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
        <Button key="save" label="保存" onClick={handleSave} />,
      ]}
    >
      <div className="resource-modal-body">
        <div className="resource-radios">
          <label>
            <input
              type="radio"
              checked={searchType === 'name'}
              onChange={() => setSearchType('name')}
            />
            ユーザー名
          </label>
          <label>
            <input
              type="radio"
              checked={searchType === 'number'}
              onChange={() => setSearchType('number')}
            />
            社員番号
          </label>
        </div>

        <input
          className="resource-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={searchType === 'name' ? 'ユーザー名を入力' : '社員番号を入力'}
        />

        <div className="resource-sort-row">
          <button className="resource-sort-btn" onClick={() => setSortByNumberAsc((v) => !v)}>
            {sortByNumberAsc ? <FaIcons.FaSortAmountUp /> : <FaIcons.FaSortAmountDown />}
            社員番号
          </button>
          <button className="resource-sort-btn" onClick={() => setSortByNameAsc((v) => !v)}>
            {sortByNameAsc ? <FaIcons.FaSortAlphaUp /> : <FaIcons.FaSortAlphaDown />}
            ユーザー名
          </button>
        </div>

        <div className="resource-list">
          {displayUsers.map((user) => (
            <label key={user.id} className="resource-item">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleSelect(user.id)}
                className="resource-checkbox"
              />
              <div className="resource-text">
                <span className="resource-number">{user.number ?? '不明'}</span>
                <span className="resource-name">{user.name ?? '名称未設定'}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </BaseModal>
  )
}
