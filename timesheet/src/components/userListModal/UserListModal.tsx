import { useEffect, useMemo, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import { BaseModal } from '../baseModal'
import { Button } from '../button'
import './UserListModal.css'

type UserItem = {
  id: string
  number?: string
  name?: string
}

export type UserListModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave?: (selectedUsers: string[]) => void
  users?: UserItem[]
}

export function UserListModal({
  isOpen,
  onClose,
  onSave,
  users = [],
}: UserListModalProps): JSX.Element | null {
  const [employeeId, setEmployeeId] = useState('')
  const [userName, setUserName] = useState('')
  const [searchResults, setSearchResults] = useState<UserItem[]>(users)
  const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([])
  const [checkedResults, setCheckedResults] = useState<string[]>([])
  const [checkedSelected, setCheckedSelected] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setSearchResults(users)
    }
  }, [isOpen, users])

  const handleSearch = () => {
    const filtered = users.filter(
      (user) =>
        (!employeeId || (user.number || '').includes(employeeId)) &&
        (!userName || (user.name || '').includes(userName))
    )
    setSearchResults(filtered)
    setCheckedResults([])
  }

  const handleClear = () => {
    setEmployeeId('')
    setUserName('')
    setSearchResults(users)
    setCheckedResults([])
  }

  const moveToSelected = () => {
    const addUsers = searchResults.filter((user) => checkedResults.includes(user.id))
    setSelectedUsers((current) => {
      const next = [...current]
      addUsers.forEach((user) => {
        if (!next.some((item) => item.id === user.id)) {
          next.push(user)
        }
      })
      return next
    })
    setCheckedResults([])
  }

  const removeCheckedSelected = () => {
    setSelectedUsers((current) =>
      current.filter((user) => !checkedSelected.includes(user.id))
    )
    setCheckedSelected([])
  }

  const handleSave = () => {
    onSave?.(selectedUsers.map((user) => user.id))
    onClose()
  }

  const searchCount = useMemo(() => searchResults.length, [searchResults])
  const selectedCount = useMemo(() => selectedUsers.length, [selectedUsers])

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="ユーザー一覧設定"
      description="表示対象ユーザーの設定を行います。"
      size="large"
      footerButtons={[
        <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
        <Button key="save" label="保存" onClick={handleSave} />,
      ]}
    >
          <div className="modal-grid">
            <div className="grid-left">
              <label className="modal-label">社員番号</label>
              <input
                className="modal-input"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                placeholder="社員番号を入力"
              />
              <div className="right-align">
                <Button label="クリア" color="secondary" onClick={handleClear} />
              </div>
            </div>

            <div className="grid-right">
              <label className="modal-label">ユーザー名</label>
              <input
                className="modal-input"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="ユーザー名を入力"
              />
              <div className="left-align">
                <Button label="検索" onClick={handleSearch} />
              </div>
            </div>
          </div>
      <hr className="divider" />

      <p className="list-description">
        左の検索結果からユーザーを選択し、右へ移動してください。
      </p>

      <div className="task-grid">
        <div className="task-list">
          <div className="list-header">
            <span className="modal-label">検索結果</span>
            <span className="count">{searchCount}件</span>
          </div>

          <div className="list-subheader">
            <div className="list-subheader-left">
              <FaIcons.FaChevronDown className="task-icon" />
              <span className="label-text">ユーザー名</span>
            </div>
          </div>

          <div className="list-box">
            {searchResults.map((user) => {
              const isSelected = selectedUsers.some((item) => item.id === user.id)
              return (
                <label
                  key={user.id}
                  className={`list-item-2line ${isSelected ? 'disabled-item' : ''}`}
                >
                  <input
                    type="checkbox"
                    disabled={isSelected}
                    checked={checkedResults.includes(user.id)}
                    onChange={() =>
                      setCheckedResults((current) =>
                        current.includes(user.id)
                          ? current.filter((id) => id !== user.id)
                          : [...current, user.id]
                      )
                    }
                  />
                  <div className="list-text">
                    <div className="category-name">{user.number || '-'}</div>
                    <div className="task-name">{user.name || '名称未設定'}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        <div className="move-button-container">
          <button type="button" onClick={moveToSelected} className="move-button">
            <IoIosArrowForward />
          </button>
        </div>

        <div className="task-list">
          <div className="list-header">
            <span className="modal-label">設定済みユーザー</span>
            <span className="count">{selectedCount}件</span>
          </div>

          <div className="list-subheader">
            <div className="list-subheader-left">
              <FaIcons.FaChevronDown className="task-icon" />
              <span className="label-text">ユーザー名</span>
            </div>

            {selectedUsers.length > 0 && (
              <Button
                label=""
                icon={<FaIcons.FaRegTrashAlt />}
                onClick={removeCheckedSelected}
                className="trash-icon-button"
              />
            )}
          </div>

          <div className="list-box">
            {selectedUsers.map((user) => (
              <div key={user.id} className="list-item-favorite">
                <div className="list-item-favorite-left">
                  <input
                    type="checkbox"
                    checked={checkedSelected.includes(user.id)}
                    onChange={() =>
                      setCheckedSelected((current) =>
                        current.includes(user.id)
                          ? current.filter((id) => id !== user.id)
                          : [...current, user.id]
                      )
                    }
                  />
                  <div className="list-text">
                    <div className="category-name">{user.number || '-'}</div>
                    <div className="task-name">{user.name || '名称未設定'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
