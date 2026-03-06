import { useEffect, useState } from 'react'
import './App.css'
import { getMessages, type AppLocale } from './i18n'
import {
  getWorkGroupRows,
  type WorkGroupRow,
  updateProjectName,
  openProjectForm,
} from './powerAppsData'

type ColumnKey = 'groupNumber' | 'groupTitle'

const linkableColumns = new Set<ColumnKey>(['groupNumber'])

type WorkGroupTableProps = {
  locale: AppLocale
}

export default function WorkGroupTable({ locale }: WorkGroupTableProps) {
  const msg = getMessages(locale)
  const columns: { key: ColumnKey; label: string }[] = [
    { key: 'groupNumber', label: msg.column_groupNumber },
    { key: 'groupTitle', label: msg.column_groupTitle },
  ]
  const [tableRows, setTableRows] = useState<WorkGroupRow[]>([])
  const [sourceRows, setSourceRows] = useState<WorkGroupRow[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteSelectedIds, setDeleteSelectedIds] = useState<Set<string>>(new Set())
  const [newRowCount, setNewRowCount] = useState(0)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRowId, setNewRowId] = useState<string | null>(null)

  const refreshRows = async () => {
    const data = await getWorkGroupRows()
    setSourceRows(data)
    setTableRows(data)
    setDeleteSelectedIds(new Set())
  }

  useEffect(() => {
    let mounted = true
    getWorkGroupRows().then((data) => {
      if (!mounted) return
      setSourceRows(data)
      setTableRows(data)
      setDeleteSelectedIds(new Set())
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleRefresh = () => {
      void refreshRows()
    }
    const handleVisibility = () => {
      if (!document.hidden) handleRefresh()
    }
    window.addEventListener('focus', handleRefresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleRefresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const handleCellClick = (columnKey: ColumnKey, rowId: string) => {
    if (!linkableColumns.has(columnKey)) return
    const row = tableRows.find((item) => item.id === rowId)
    if (row?.projectId) {
      openProjectForm(row.projectId)
    }
  }

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

  const handleCreateNew = () => {
    if (showAddRow) return
    const nextIndex = newRowCount + 1
    const newId = `new-row-${Date.now()}-${nextIndex}`
    const newRow: WorkGroupRow = {
      id: newId,
      woNumber: '',
      woTitle: '',
      status: '',
      groupNumber: '',
      groupTitle: '',
      projectId: '',
    }
    setNewRowCount(nextIndex)
    setTableRows((prev) => [...prev, newRow])
    setShowAddRow(true)
    setNewRowId(newId)
    setSelectedId(newId)
    setEditingId(newId)
  }

  const handleSave = () => {
    if (!showAddRow) return
    setSourceRows(tableRows)
    setShowAddRow(false)
    setNewRowId(null)
    setEditingId(null)
  }

  const handleDelete = () => {
    if (showAddRow) return
    if (deleteSelectedIds.size === 0) return
    const deleteSet = deleteSelectedIds
    setTableRows((prev) => prev.filter((row) => !deleteSet.has(row.id)))
    if (selectedId && deleteSet.has(selectedId)) {
      setSelectedId(null)
    }
    if (editingId && deleteSet.has(editingId)) {
      setEditingId(null)
    }
    setDeleteSelectedIds(new Set())
  }

  const handleCancel = () => {
    setTableRows(sourceRows)
    setDeleteSelectedIds(new Set())
    setShowAddRow(false)
    setNewRowId(null)
    setEditingId(null)
    setSelectedId(null)
  }

  const handleDeleteCheckToggle = (id: string) => {
    setDeleteSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <section className="panel work-group">
      <header className="panel-header">
        <div className="panel-title">
          <span>{msg.currentGroupTitle}</span>
        </div>
        <div className="file-table-actions">
          <button
            type="button"
            className="action-button action-button-neutral"
            onClick={handleCreateNew}
            disabled={showAddRow}
          >
            <span>{msg.createNew}</span>
          </button>
          <button
            type="button"
            className="action-button action-button-primary"
            onClick={handleSave}
            disabled={!showAddRow}
          >
            <span>{msg.save}</span>
          </button>
          <button
            type="button"
            className="action-button action-button-danger"
            onClick={handleDelete}
            disabled={deleteSelectedIds.size === 0 || showAddRow}
          >
            <span>{msg.delete}</span>
          </button>
          <button
            type="button"
            className={`action-button ${showAddRow ? 'action-button-danger' : 'action-button-neutral'}`}
            onClick={handleCancel}
          >
            <span>{msg.cancel}</span>
          </button>
        </div>
      </header>

      <div className="table-shell">
        <div className="table-head">
          <div className="th checkbox" />
          {columns.map((col) => (
            <div key={col.key} className="th">
              <span className="th-label">{col.label}</span>
            </div>
          ))}
        </div>

        <div className="table-body">
          {tableRows.map((row) => (
            <div
              className={`tr ${selectedId === row.id ? 'is-selected' : ''} ${newRowId === row.id ? 'is-add-row' : ''}`}
              key={row.id}
              onClick={() => setSelectedId(row.id)}
            >
              <div
                className="td checkbox"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <label className="cb">
                  <input
                    type="checkbox"
                    checked={deleteSelectedIds.has(row.id)}
                    onChange={() => handleDeleteCheckToggle(row.id)}
                    aria-label="delete"
                  />
                  <span className="cb-box" />
                </label>
              </div>
              {newRowId === row.id ? (
                <div className="td muted">-</div>
              ) : (
                <div
                  className={`td ${linkableColumns.has('groupNumber') ? 'is-link' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleCellClick('groupNumber', row.id)
                  }}
                  role={linkableColumns.has('groupNumber') ? 'link' : undefined}
                >
                  {row.groupNumber}
                </div>
              )}
              <div className="td" onClick={() => handleStartEdit(row.id)}>
                {editingId === row.id || newRowId === row.id ? (
                  <input
                    className="cell-input is-editing"
                    value={row.groupTitle}
                    onChange={(event) => handleGroupTitleChange(row.id, event.target.value)}
                    onBlur={() => {
                      if (newRowId === row.id) return
                      handleFinishEdit()
                      handleGroupTitleCommit(row.id, row.projectId, row.groupTitle)
                    }}
                    onClick={(event) => event.stopPropagation()}
                    autoFocus
                    placeholder={msg.column_groupTitle}
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
