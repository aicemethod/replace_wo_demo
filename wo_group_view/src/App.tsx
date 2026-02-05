import { useMemo, useState, useEffect } from 'react'
import './App.css'

const rows = [
  {
    id: 1,
    title: 'あああああ',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2025/10/11 16:50',
  },
  {
    id: 2,
    title: 'サンプル②',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2025/10/13 22:11',
  },
  {
    id: 3,
    title: 'テスト',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2025/12/17 16:08',
  },
  {
    id: 4,
    title: '',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2026/01/22 10:20',
  },
  {
    id: 5,
    title: 'サンプル③',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2026/01/29 09:12',
  },
  {
    id: 6,
    title: 'サンプル④',
    status: 'アクティブ',
    region: '',
    recordDate: '',
    author: '阿部 大輔',
    delegate: '',
    createdAt: '2026/02/01 14:35',
  },
]

const linkableColumns = new Set([
  'work',
  'status',
])

function App() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const allSelected = useMemo(
    () => rows.length > 0 && selectedIds.length === rows.length,
    [selectedIds]
  )

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? rows.map((row) => row.id) : [])
  }

  const toggleRow = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id]
      }
      return prev.filter((item) => item !== id)
    })
  }

  useEffect(() => {
    const handle = () => setOpenMenu(null)
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => (prev === key ? null : key))
  }

  const handleCellClick = (columnKey: string, rowId: number) => {
    if (!linkableColumns.has(columnKey)) return
    // TODO: replace with real navigation
    console.log('navigate', { columnKey, rowId })
  }

  return (
    <div className="page">
      <section className="panel">
        <header className="panel-header">
          <div className="panel-title">
            <span>WOグループ候補リスト</span>
            {/* <span className="caret" aria-hidden="true">
              <svg viewBox="0 0 12 8" aria-hidden="true">
                <path d="M2 2.5L6 6l4-3.5" />
              </svg>
            </span> */}
          </div>
          <div className="panel-actions">
            <button className="top-btn" type="button">
              <span className="btn-icon">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 3h9v9H2z" />
                  <path d="M13 4h2v2M13 8h2v2M13 12h2v2" />
                  <path d="M4.5 12.5l1.5 1.5l3-3" />
                </svg>
              </span>
              列 の編集
            </button>
            <button className="top-btn" type="button">
              <span className="btn-icon">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 3h12l-5 5v4l-2 1V8L2 3z" />
                </svg>
              </span>
              フィルターを編集する
            </button>
          </div>
        </header>

        <div className="table-shell">
          <div className="table-head">
            <div className="th checkbox">
              <label className="cb">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                  aria-label="select all"
                />
                <span className="cb-box" aria-hidden="true">
                  <svg viewBox="0 0 12 10">
                    <path d="M1.5 5.5L4.5 8.5L10.5 1.5" />
                  </svg>
                </span>
              </label>
            </div>
            {[
              { key: 'work', label: '作業番号' },
              { key: 'status', label: 'ステータス' },
              { key: 'region', label: 'リージョン' },
              { key: 'record', label: 'レコード作成日' },
              { key: 'author', label: '作成者' },
              { key: 'delegate', label: '修正者（代理）' },
              { key: 'created', label: '作成日' },
            ].map((col) => (
              <div
                key={col.key}
                className="th th-menu"
                onClick={(event) => {
                  event.stopPropagation()
                  toggleMenu(col.key)
                }}
              >
                <span className="th-label">{col.label}</span>
                <span className="caret" aria-hidden="true">
                  <svg viewBox="0 0 12 8" aria-hidden="true">
                    <path d="M2 2.5L6 6l4-3.5" />
                  </svg>
                </span>
                {openMenu === col.key ? (
                  <div
                    className="col-menu"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M8 13V3M8 3l-3 3M8 3l3 3" />
                        </svg>
                      </span>
                      昇順
                    </button>
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M8 3v10M8 13l-3-3M8 13l3-3" />
                        </svg>
                      </span>
                      降順
                    </button>
                    <div className="menu-sep" />
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M3 5h6M3 8h10M3 11h4" />
                        </svg>
                      </span>
                      グループ化
                    </button>
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M2 3h12l-5 5v4l-2 1V8L2 3z" />
                        </svg>
                      </span>
                      フィルター
                    </button>
                    <div className="menu-sep" />
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M3 8h10M6 6v4M10 6v4" />
                        </svg>
                      </span>
                      列幅
                    </button>
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M10 4L6 8l4 4" />
                        </svg>
                      </span>
                      左へ移動
                    </button>
                    <button className="menu-item" role="menuitem">
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </span>
                      右へ移動
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="table-body">
            {rows.map((row) => (
              <div
                className={`tr ${selectedIds.includes(row.id) ? 'is-selected' : ''}`}
                key={row.id}
              >
                <div className="td checkbox">
                  <label className="cb">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(event) => toggleRow(row.id, event.target.checked)}
                      aria-label="select row"
                    />
                    <span className="cb-box" aria-hidden="true">
                      <svg viewBox="0 0 12 10">
                        <path d="M1.5 5.5L4.5 8.5L10.5 1.5" />
                      </svg>
                    </span>
                  </label>
                </div>
                <div
                  className={`td ${linkableColumns.has('work') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('work', row.id)}
                  role={linkableColumns.has('work') ? 'link' : undefined}
                >
                  {row.title ? row.title : <span className="muted">（空）</span>}
                </div>
                <div
                  className={`td status-cell ${linkableColumns.has('status') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('status', row.id)}
                  role={linkableColumns.has('status') ? 'link' : undefined}
                >
                  {row.status}
                </div>
                <div
                  className={`td muted ${linkableColumns.has('region') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('region', row.id)}
                  role={linkableColumns.has('region') ? 'link' : undefined}
                >
                  {row.region || ''}
                </div>
                <div
                  className={`td muted ${linkableColumns.has('record') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('record', row.id)}
                  role={linkableColumns.has('record') ? 'link' : undefined}
                >
                  {row.recordDate || ''}
                </div>
                <div
                  className={`td ${linkableColumns.has('author') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('author', row.id)}
                  role={linkableColumns.has('author') ? 'link' : undefined}
                >
                  <span className="user">
                    <span className="avatar">阿</span>
                    {row.author}
                  </span>
                </div>
                <div
                  className={`td muted ${linkableColumns.has('delegate') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('delegate', row.id)}
                  role={linkableColumns.has('delegate') ? 'link' : undefined}
                >
                  {row.delegate || ''}
                </div>
                <div
                  className={`td ${linkableColumns.has('created') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('created', row.id)}
                  role={linkableColumns.has('created') ? 'link' : undefined}
                >
                  {row.createdAt}
                </div>
              </div>
            ))}
          </div>

          <div className="table-footer">行: {rows.length}</div>
        </div>
      </section>
    </div>
  )
}

export default App
