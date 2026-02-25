import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { getMessages, type AppLocale } from './i18n'
import {
  getSameGroupRows,
  type WorkGroupRow,
  openWorkorderForm,
  clearWorkordersProject,
} from './powerAppsData'

type ColumnKey = 'woNumber' | 'woTitle' | 'status' | 'groupNumber' | 'groupTitle'

const linkableColumns = new Set<ColumnKey>(['woNumber'])

type WorkSameGroupTableProps = {
  locale: AppLocale
}

export default function WorkSameGroupTable({ locale }: WorkSameGroupTableProps) {
  const msg = getMessages(locale)
  const columns: { key: ColumnKey; label: string }[] = [
    { key: 'woNumber', label: msg.column_woNumber },
    { key: 'woTitle', label: msg.column_woTitle },
    { key: 'status', label: msg.column_status },
    { key: 'groupNumber', label: msg.column_groupNumber },
    { key: 'groupTitle', label: msg.column_groupTitle },
  ]
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tableRows, setTableRows] = useState<WorkGroupRow[]>([])
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

  const refreshSameGroupRows = async () => {
    const data = await getSameGroupRows()
    setTableRows(data)
  }

  useEffect(() => {
    let mounted = true
    getSameGroupRows().then((data) => {
      if (mounted) setTableRows(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleRefresh = () => {
      void refreshSameGroupRows()
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

  const handleClearGroup = async () => {
    if (selectedIds.length === 0) return
    await clearWorkordersProject(selectedIds)
    setSelectedIds([])
    await refreshSameGroupRows()
  }

  const handleCellClick = (columnKey: ColumnKey, rowId: string) => {
    if (!linkableColumns.has(columnKey)) return
    openWorkorderForm(rowId)
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title">
          <span>{msg.sameGroupTitle}</span>
          <button className="top-btn" type="button" onClick={handleClearGroup}>
            {msg.unbindGroup}
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
                aria-label={msg.selectAll}
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
                    aria-label={msg.selectRow}
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

        <div className="table-footer">{msg.rows}: {tableRows.length}</div>
      </div>
    </section>
  )
}
