import { useEffect, useState } from 'react'
import './App.css'
import {
  getWorkGroupRows,
  type WorkGroupRow,
  updateProjectName,
  openProjectForm,
} from './powerAppsData'

type ColumnKey = 'groupNumber' | 'groupTitle'

const linkableColumns = new Set<ColumnKey>(['groupNumber'])

const columns: { key: ColumnKey; label: string }[] = [
  { key: 'groupNumber', label: 'WOグループ番号' },
  { key: 'groupTitle', label: 'WOグループタイトル' },
]

export default function WorkGroupTable() {
  const [tableRows, setTableRows] = useState<WorkGroupRow[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getWorkGroupRows().then((data) => {
      if (mounted) setTableRows(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleCellClick = (columnKey: ColumnKey, rowId: string) => {
    if (!linkableColumns.has(columnKey)) return
    const row = tableRows.find((item) => item.id === rowId)
    if (row?.projectId) {
      openProjectForm(row.projectId)
    }
  }

  // const refreshRows = async () => {
  //   const data = await getWorkGroupRows()
  //   setTableRows(data)
  // }

  const handleGroupTitleChange = (id: string, value: string) => {
    setTableRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, groupTitle: value } : row))
    )
  }

  const handleGroupTitleCommit = async (id: string, projectId: string, value: string) => {
    await updateProjectName(projectId, value)
    setTableRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, groupTitle: value } : row))
    )
  }

  const handleStartEdit = (id: string) => {
    setEditingId(id)
  }

  const handleFinishEdit = () => {
    setEditingId(null)
  }

  return (
    <section className="panel work-group">
      <header className="panel-header">
        <div className="panel-title">
          <span>このWOが所属するWOグループ</span>
        </div>
      </header>

      <div className="table-shell">
        <div className="table-head">
          {columns.map((col) => (
            <div key={col.key} className="th">
              <span className="th-label">{col.label}</span>
            </div>
          ))}
        </div>

        <div className="table-body">
          {tableRows.map((row) => (
            <div className="tr" key={row.id}>
              <div
                className={`td ${linkableColumns.has('groupNumber') ? 'is-link' : ''}`}
                onClick={() => handleCellClick('groupNumber', row.id)}
                role={linkableColumns.has('groupNumber') ? 'link' : undefined}
              >
                {row.groupNumber}
              </div>
              <div className="td" onClick={() => handleStartEdit(row.id)}>
                {editingId === row.id ? (
                  <input
                    className="cell-input is-editing"
                    value={row.groupTitle}
                    onChange={(event) => handleGroupTitleChange(row.id, event.target.value)}
                    onBlur={() => {
                      handleFinishEdit()
                      handleGroupTitleCommit(row.id, row.projectId, row.groupTitle)
                    }}
                    autoFocus
                  />
                ) : (
                  row.groupTitle
                )}
              </div>
            </div>
          ))}
        </div>

        {/* <div className="table-footer">行: {tableRows.length}</div> */}
      </div>
    </section>
  )
}
