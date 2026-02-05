import { useMemo, useState } from 'react'
import './App.css'

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
    woNumber: '00000010',
    woTitle: '定期保守点検',
    status: 'In Progress',
    groupNumber: 'WOG01',
    groupTitle: '北関東メンテ',
  },
  {
    id: 2,
    woNumber: '00000011',
    woTitle: '設備更新',
    status: 'Signed',
    groupNumber: 'WOG01',
    groupTitle: '北関東メンテ',
  },
  {
    id: 3,
    woNumber: '00000012',
    woTitle: '安全対策',
    status: 'Closed',
    groupNumber: 'WOG01',
    groupTitle: '北関東メンテ',
  },
]

type ColumnKey = 'woNumber' | 'woTitle' | 'status' | 'groupNumber' | 'groupTitle'

const linkableColumns = new Set<ColumnKey>(['woNumber'])

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'woNumber', label: 'WO番号' },
  { key: 'woTitle', label: 'WOタイトル' },
  { key: 'status', label: 'ステータス' },
  { key: 'groupNumber', label: 'WOグループ番号' },
  { key: 'groupTitle', label: 'WOグループタイトル' },
]

export default function WorkSameGroupTable() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
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

  const handleCellClick = (columnKey: ColumnKey, rowId: number) => {
    if (!linkableColumns.has(columnKey)) return
    console.log('navigate', { columnKey, rowId })
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title">
          <span>同一グループのWO</span>
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
            <div key={col.key} className="th">
              <span className="th-label">{col.label}</span>
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
                className={`td ${linkableColumns.has('woNumber') ? 'is-link' : ''}`}
                onClick={() => handleCellClick('woNumber', row.id)}
                role={linkableColumns.has('woNumber') ? 'link' : undefined}
              >
                {row.woNumber}
              </div>
              <div className="td">{row.woTitle}</div>
              <div className="td status-cell">{row.status}</div>
              <div className="td">{row.groupNumber}</div>
              <div className="td">{row.groupTitle}</div>
            </div>
          ))}
        </div>

        <div className="table-footer">行: {rows.length}</div>
      </div>
    </section>
  )
}
