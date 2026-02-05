import { useMemo, useState, useEffect } from 'react'
import './App.css'
import { sortRows, type SortDirection } from './sortUtils'
import {
  filterRows,
  type FilterOperatorKey,
  filterOperatorOptions,
  getFilterOperatorLabel,
  operatorNeedsValue,
} from './filterUtils'

type Row = {
  id: number
  woNumber: string
  woTitle: string
  status: 'In Progress' | 'Signed' | 'Closed'
  groupNumber: string
  groupTitle: string
}

const rows: Row[] = [
  {
    id: 1,
    woNumber: '00000000',
    woTitle: '定期保守点検',
    status: 'In Progress',
    groupNumber: 'WOG01',
    groupTitle: '北関東メンテ',
  },
  {
    id: 2,
    woNumber: '00000001',
    woTitle: '設備更新',
    status: 'Signed',
    groupNumber: 'WOG02',
    groupTitle: '東北エリアA',
  },
  {
    id: 3,
    woNumber: '00000002',
    woTitle: '安全対策',
    status: 'Closed',
    groupNumber: 'WOG03',
    groupTitle: '関西支店B',
  },
  {
    id: 4,
    woNumber: '00000003',
    woTitle: '定期清掃',
    status: 'In Progress',
    groupNumber: 'WOG04',
    groupTitle: '中部メンテ',
  },
  {
    id: 5,
    woNumber: '00000004',
    woTitle: '設備点検',
    status: 'Signed',
    groupNumber: 'WOG05',
    groupTitle: '九州南部',
  },
  {
    id: 6,
    woNumber: '00000005',
    woTitle: '試運転',
    status: 'Closed',
    groupNumber: 'WOG06',
    groupTitle: '北海道東部',
  },
]

type ColumnKey =
  | 'woNumber'
  | 'woTitle'
  | 'status'
  | 'groupNumber'
  | 'groupTitle'

const columnKeyMap: Record<ColumnKey, keyof Row> = {
  woNumber: 'woNumber',
  woTitle: 'woTitle',
  status: 'status',
  groupNumber: 'groupNumber',
  groupTitle: 'groupTitle',
}

const linkableColumns = new Set<ColumnKey>([
  'woNumber',
])

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'woNumber', label: 'WO番号' },
  { key: 'woTitle', label: 'WOタイトル' },
  { key: 'status', label: 'ステータス' },
  { key: 'groupNumber', label: 'WOグループ番号' },
  { key: 'groupTitle', label: 'WOグループタイトル' },
]

function App() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [tableRows, setTableRows] = useState<Row[]>(rows)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterValue, setFilterValue] = useState('')
  const [menuFilterKey, setMenuFilterKey] = useState<ColumnKey | null>(null)
  const [filterOperator, setFilterOperator] = useState<FilterOperatorKey>('equals')
  const [operatorOpen, setOperatorOpen] = useState(false)
  const allSelected = useMemo(
    () => tableRows.length > 0 && selectedIds.length === tableRows.length,
    [selectedIds, tableRows.length]
  )

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? tableRows.map((row) => row.id) : [])
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
    const handle = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.col-menu') || target?.closest('.filter-pop')) {
        return
      }
      setOpenMenu(null)
      setMenuFilterKey(null)
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  const toggleMenu = (key: string) => {
    setOpenMenu((prev) => {
      const next = prev === key ? null : key
      if (!next) {
        setMenuFilterKey(null)
      } else if (prev && prev !== key) {
        setMenuFilterKey(null)
      }
      return next
    })
  }

  const handleSort = (columnKey: ColumnKey, direction: SortDirection) => {
    setTableRows((prev) => sortRows(prev, columnKeyMap, columnKey, direction))
    setOpenMenu(null)
  }

  const operatorLabel = getFilterOperatorLabel(filterOperator)

  const applyFilter = () => {
    const value = filterValue.trim()
    if (operatorNeedsValue(filterOperator) && !value) {
      setTableRows(rows)
      return
    }
    const searchableKeys = Object.values(columnKeyMap)
    setTableRows(filterRows(rows, searchableKeys, filterOperator, value))
    setFilterOpen(false)
    setMenuFilterKey(null)
    setOperatorOpen(false)
  }

  const handleCellClick = (columnKey: ColumnKey, rowId: number) => {
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
            <button
              className="top-btn"
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              <span className="btn-icon">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 3h12l-5 5v4l-2 1V8L2 3z" />
                </svg>
              </span>
              フィルターを編集する
            </button>
            {filterOpen ? (
              <div className="filter-pop" role="dialog" aria-label="フィルター">
                <div className="filter-head">
                  <span>フィルター</span>
                  <button
                    className="filter-close"
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    aria-label="close"
                  >
                    ×
                  </button>
                </div>
                <div className="filter-body">
                  <div className="filter-label">次の値と等しい</div>
                  <div className="filter-select">
                    <select>
                      <option>次の値と等しい</option>
                    </select>
                    <span className="select-caret" aria-hidden="true">
                      <svg viewBox="0 0 12 8">
                        <path d="M2 2.5L6 6l4-3.5" />
                      </svg>
                    </span>
                  </div>
                  <div className="filter-select">
                    <input
                      type="text"
                      value={filterValue}
                      onChange={(event) => setFilterValue(event.target.value)}
                      placeholder=""
                    />
                    <span className="select-caret" aria-hidden="true">
                      <svg viewBox="0 0 12 8">
                        <path d="M2 2.5L6 6l4-3.5" />
                      </svg>
                    </span>
                  </div>
                  <button className="filter-apply" type="button" onClick={applyFilter}>
                    適用
                  </button>
                </div>
              </div>
            ) : null}
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
            {columns.map((col) => (
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
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => handleSort(col.key, 'asc')}
                    >
                      <span className="menu-icon">
                        <svg viewBox="0 0 16 16">
                          <path d="M8 13V3M8 3l-3 3M8 3l3 3" />
                        </svg>
                      </span>
                      昇順
                    </button>
                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => handleSort(col.key, 'desc')}
                    >
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
                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() =>
                        setMenuFilterKey((prev) => (prev === col.key ? null : col.key))
                      }
                    >
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
                    {menuFilterKey === col.key ? (
                      <div
                        className="filter-pop in-menu"
                        role="dialog"
                        aria-label="フィルター"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="filter-head">
                          <span>フィルター</span>
                          <button
                            className="filter-close"
                            type="button"
                            onClick={() => setMenuFilterKey(null)}
                            aria-label="close"
                          >
                            ×
                          </button>
                        </div>
                        <div className="filter-body">
                          <div className="filter-label">次の値と等しい</div>
                          <div className="filter-select">
                            <button
                              className="select-button"
                              type="button"
                              onClick={() => setOperatorOpen((prev) => !prev)}
                            >
                              <span>{operatorLabel}</span>
                              <span className="select-caret" aria-hidden="true">
                                <svg viewBox="0 0 12 8">
                                  <path d="M2 2.5L6 6l4-3.5" />
                                </svg>
                              </span>
                            </button>
                            {operatorOpen ? (
                              <div className="select-options">
                                {filterOperatorOptions.map((option) => (
                                  <button
                                    key={option.key}
                                    className="select-option"
                                    type="button"
                                    onClick={() => {
                                      setFilterOperator(option.key as FilterOperatorKey)
                                      setOperatorOpen(false)
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="filter-select">
                            <input
                              type="text"
                              value={filterValue}
                              onChange={(event) => setFilterValue(event.target.value)}
                              placeholder=""
                              disabled={!operatorNeedsValue(filterOperator)}
                            />
                            <span className="select-caret" aria-hidden="true">
                              <svg viewBox="0 0 12 8">
                                <path d="M2 2.5L6 6l4-3.5" />
                              </svg>
                            </span>
                          </div>
                          <button
                            className="filter-apply"
                            type="button"
                            onClick={applyFilter}
                          >
                            適用
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="table-body">
            {tableRows.map((row) => (
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
                  className={`td ${linkableColumns.has('woNumber') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('woNumber', row.id)}
                  role={linkableColumns.has('woNumber') ? 'link' : undefined}
                >
                  {row.woNumber}
                </div>
                <div
                  className={`td ${linkableColumns.has('woTitle') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('woTitle', row.id)}
                  role={linkableColumns.has('woTitle') ? 'link' : undefined}
                >
                  {row.woTitle}
                </div>
                <div
                  className={`td status-cell ${linkableColumns.has('status') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('status', row.id)}
                  role={linkableColumns.has('status') ? 'link' : undefined}
                >
                  {row.status}
                </div>
                <div
                  className={`td ${linkableColumns.has('groupNumber') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('groupNumber', row.id)}
                  role={linkableColumns.has('groupNumber') ? 'link' : undefined}
                >
                  {row.groupNumber}
                </div>
                <div
                  className={`td ${linkableColumns.has('groupTitle') ? 'is-link' : ''}`}
                  onClick={() => handleCellClick('groupTitle', row.id)}
                  role={linkableColumns.has('groupTitle') ? 'link' : undefined}
                >
                  {row.groupTitle}
                </div>
              </div>
            ))}
          </div>

          <div className="table-footer">行: {tableRows.length}</div>
        </div>
      </section>
    </div>
  )
}

export default App
