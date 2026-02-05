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
import {
  getMainRows,
  type WorkGroupRow,
  updateWorkordersProject,
  openWorkorderForm,
} from './powerAppsData'

type ColumnKey = 'woNumber' | 'woTitle' | 'status' | 'groupNumber' | 'groupTitle'

const columnKeyMap: Record<ColumnKey, keyof WorkGroupRow> = {
  woNumber: 'woNumber',
  woTitle: 'woTitle',
  status: 'status',
  groupNumber: 'groupNumber',
  groupTitle: 'groupTitle',
}

const linkableColumns = new Set<ColumnKey>(['woNumber'])

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'woNumber', label: 'WO番号' },
  { key: 'woTitle', label: 'WOタイトル' },
  { key: 'status', label: 'ステータス' },
  { key: 'groupNumber', label: 'WOグループ番号' },
  { key: 'groupTitle', label: 'WOグループタイトル' },
]

export default function WorkTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [tableRows, setTableRows] = useState<WorkGroupRow[]>([])
  const [sourceRows, setSourceRows] = useState<WorkGroupRow[]>([])
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

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id]
      }
      return prev.filter((item) => item !== id)
    })
  }

  useEffect(() => {
    let mounted = true
    getMainRows().then((data) => {
      if (!mounted) return
      setSourceRows(data)
      setTableRows(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  const refreshMainRows = async () => {
    const data = await getMainRows()
    setSourceRows(data)
    setTableRows(data)
  }

  const handleBindGroup = async () => {
    if (selectedIds.length === 0) return
    await updateWorkordersProject(selectedIds)
    await refreshMainRows()
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
      setTableRows(sourceRows)
      return
    }
    const searchableKeys = Object.values(columnKeyMap)
    setTableRows(filterRows(sourceRows, searchableKeys, filterOperator, value))
    setFilterOpen(false)
    setMenuFilterKey(null)
    setOperatorOpen(false)
    setOpenMenu(null)
  }

  const handleCellClick = (columnKey: ColumnKey, rowId: string) => {
    if (!linkableColumns.has(columnKey)) return
    openWorkorderForm(rowId)
  }

  return (
    <section className={`panel ${menuFilterKey ? 'is-filter-open' : ''}`}>
      <header className="panel-header">
        <div className="panel-title">
          <span>WOグループ候補リスト</span>
        </div>
        <div className="panel-actions">
          {/* <button className="top-btn" type="button">
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
          </button> */}
          <button className="top-btn" type="button" onClick={handleBindGroup}>
            WOグループ紐付け
          </button>
          {/* {filterOpen ? (
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
                            setFilterOperator(option.key)
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
                <button className="filter-apply" type="button" onClick={applyFilter}>
                  適用
                </button>
              </div>
            </div>
          ) : null} */}
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
                  {/* <div className="menu-sep" />
                  <button className="menu-item" role="menuitem">
                    <span className="menu-icon">
                      <svg viewBox="0 0 16 16">
                        <path d="M3 5h6M3 8h10M3 11h4" />
                      </svg>
                    </span>
                    グループ化
                  </button> */}
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
                  {/* <div className="menu-sep" />
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
                  </button> */}
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
                                    setFilterOperator(option.key)
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
                        </div>
                        <button className="filter-apply" type="button" onClick={applyFilter}>
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
  )
}
