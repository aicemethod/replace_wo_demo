import { useEffect, useMemo, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import './Sidebar.css'

type SidebarUser = {
  id: string
  number?: string
  name?: string
}

type SearchType = 'name' | 'number'
type SortKey = 'numberAsc' | 'numberDesc' | 'nameAsc' | 'nameDesc'

export type SidebarProps = {
  users?: SidebarUser[]
  selfUser?: SidebarUser
  onSelectionChange?: (users: SidebarUser[]) => void
}

export function Sidebar({
  users = [],
  selfUser = { id: 'self', number: '', name: '' },
  onSelectionChange,
}: SidebarProps): JSX.Element {
  const [searchType, setSearchType] = useState<SearchType>('name')
  const [keyword, setKeyword] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>(['self'])
  const [sortOpen, setSortOpen] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('numberAsc')

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const target = searchType === 'name' ? user.name || '' : user.number || ''
      return target.toLowerCase().includes(keyword.toLowerCase())
    })

    const sortMap: Record<SortKey, (a: SidebarUser, b: SidebarUser) => number> = {
      numberAsc: (a, b) => (a.number || '').localeCompare(b.number || ''),
      numberDesc: (a, b) => (b.number || '').localeCompare(a.number || ''),
      nameAsc: (a, b) => (a.name || '').localeCompare(b.name || ''),
      nameDesc: (a, b) => (b.name || '').localeCompare(a.name || ''),
    }

    return [...filtered].sort(sortMap[sortKey])
  }, [users, searchType, keyword, sortKey])

  useEffect(() => {
    if (!onSelectionChange) return

    const selected = selectedUsers.map((id) =>
      id === 'self' ? selfUser : users.find((user) => user.id === id)
    ).filter(Boolean) as SidebarUser[]

    onSelectionChange(selected)
  }, [onSelectionChange, selfUser, selectedUsers, users])

  const toggleUser = (id: string) => {
    setSelectedUsers((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    )
  }

  const sortOptions = [
    { value: 'numberAsc', label: '▲ 社員番号昇順' },
    { value: 'numberDesc', label: '▼ 社員番号降順' },
    { value: 'nameAsc', label: '▲ ユーザー名昇順' },
    { value: 'nameDesc', label: '▼ ユーザー名降順' },
  ] as const

  return (
    <aside className="sidebar-container">
      <h2 className="sidebar-title">検索</h2>

      <div className="sidebar-radios">
        <label>
          <input
            type="radio"
            name="sidebarSearchType"
            checked={searchType === 'name'}
            onChange={() => setSearchType('name')}
          />
          ユーザー名
        </label>
        <label>
          <input
            type="radio"
            name="sidebarSearchType"
            checked={searchType === 'number'}
            onChange={() => setSearchType('number')}
          />
          社員番号
        </label>
      </div>

      <input
        className="sidebar-input"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={searchType === 'name' ? 'ユーザー名を入力' : '社員番号を入力'}
      />

      <label className="sidebar-self-item">
        <input
          type="checkbox"
          className="sidebar-checkbox"
          checked={selectedUsers.includes('self')}
          onChange={() => toggleUser('self')}
        />
        <div className="sidebar-self-text">
          <span className="sidebar-self-number">{`${selfUser.number || ''}（自分）`}</span>
          <span className="sidebar-self-roman">{selfUser.name || ''}</span>
        </div>
      </label>

      <div
        className="sidebar-self-divider"
        onClick={() => setSortOpen((current) => !current)}
      >
        <FaIcons.FaChevronDown
          className={`sidebar-self-icon ${sortOpen ? 'rotated' : ''}`}
        />
        <span className="sidebar-self-label">ユーザー名</span>
        <FaIcons.FaSortAmountDown className="sidebar-self-icon" />
      </div>

      {sortOpen && (
        <div className="sidebar-sort-dropdown">
          {sortOptions.map((option) => (
            <div
              key={option.value}
              className={`sidebar-sort-option ${sortKey === option.value ? 'active' : ''}`}
              onClick={() => {
                setSortKey(option.value)
                setSortOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-results">
        {filteredUsers.map((user) => (
          <label key={user.id} className="sidebar-result-item">
            <input
              type="checkbox"
              className="sidebar-checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => toggleUser(user.id)}
            />
            <span className="sidebar-result-text">
              {user.number || '不明'} {user.name || '名称未設定'}
            </span>
          </label>
        ))}
      </div>
    </aside>
  )
}
