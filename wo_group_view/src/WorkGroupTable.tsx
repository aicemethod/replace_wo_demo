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
]

type ColumnKey = 'woNumber' | 'woTitle' | 'status' | 'groupNumber' | 'groupTitle'

// const columnKeyMap: Record<ColumnKey, keyof Row> = {
//   woNumber: 'woNumber',
//   woTitle: 'woTitle',
//   status: 'status',
//   groupNumber: 'groupNumber',
//   groupTitle: 'groupTitle',
// }

const linkableColumns = new Set<ColumnKey>(['groupNumber'])

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'woNumber', label: 'WO番号' },
  { key: 'woTitle', label: 'WOタイトル' },
  { key: 'status', label: 'ステータス' },
  { key: 'groupNumber', label: 'WOグループ番号' },
  { key: 'groupTitle', label: 'WOグループタイトル' },
]

export default function WorkGroupTable() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [tableRows, setTableRows] = useState<Row[]>(rows)
  const [editingId, setEditingId] = useState<number | null>(null)

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

  const handleCellClick = (columnKey: ColumnKey, rowId: number) => {
    if (!linkableColumns.has(columnKey)) return
    console.log('navigate', { columnKey, rowId })
  }

  const handleGroupTitleChange = (id: number, value: string) => {
    setTableRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, groupTitle: value } : row))
    )
  }

  const handleStartEdit = (id: number) => {
    setEditingId(id)
  }

  const handleFinishEdit = () => {
    setEditingId(null)
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title">
          <span>このWOが所属するWOグループ</span>
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
                className="td"
                onClick={() => handleCellClick('woNumber', row.id)}
              >
                {row.woNumber}
              </div>
              <div className="td">{row.woTitle}</div>
              <div className="td status-cell">{row.status}</div>
              <div
                className={`td ${linkableColumns.has('groupNumber') ? 'is-link' : ''}`}
                onClick={() => handleCellClick('groupNumber', row.id)}
                role={linkableColumns.has('groupNumber') ? 'link' : undefined}
              >
                {row.groupNumber}
              </div>
              <div
                className="td"
                onClick={() => handleStartEdit(row.id)}
              >
                {editingId === row.id ? (
                  <input
                    className="cell-input is-editing"
                    value={row.groupTitle}
                    onChange={(event) => handleGroupTitleChange(row.id, event.target.value)}
                    onBlur={handleFinishEdit}
                    autoFocus
                  />
                ) : (
                  row.groupTitle
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="table-footer">行: {tableRows.length}</div>
      </div>
    </section>
  )
}
