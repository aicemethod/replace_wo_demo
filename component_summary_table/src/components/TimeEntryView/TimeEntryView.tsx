import { useState } from 'react'
import { summaryData } from './data'
import './TimeEntryView.css'

const formatDate = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default function TimeEntryView() {
  const [isLoading, setIsLoading] = useState(false)

  const totals = {
    person: summaryData.reduce((s, r) => s + r.personCount, 0),
    work: summaryData.reduce((s, r) => s + r.totalWorkHours, 0),
    travel: summaryData.reduce((s, r) => s + r.totalTravelHours, 0)
  }

  const handleAggregate = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsLoading(false)
  }

  return (
    <div className="time-entry-view">
      <div className="summary-section">
        <div className="summary-header">
          <span className="summary-title">Time Entry サマリ</span>
          <div className="summary-info">
            <span className="count-badge">{summaryData.length}件</span>
            <div className="last-aggregate">
              <div>最終集計</div>
              <div>{formatDate(new Date())}</div>
            </div>
            <button onClick={handleAggregate} disabled={isLoading} className="aggregate-btn">
              データ集計
            </button>
          </div>
        </div>
        <div className="table-container">
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <div className="loading-text">データを集計中...</div>
            </div>
          )}
          <div className="table-wrapper">
            <table className="summary-table">
              <thead>
                <tr><th>日付</th><th>人数（人）</th><th>合計作業時間（H）</th><th>合計移動時間（H）</th></tr>
              </thead>
              <tbody>
                {summaryData.map((r, i) => (
                  <tr key={i}><td>{r.date}</td><td>{r.personCount}</td><td>{r.totalWorkHours} H</td><td>{r.totalTravelHours} H</td></tr>
                ))}
                <tr className="total-row"><td>合計</td><td>{totals.person} 人</td><td>{totals.work} H</td><td>{totals.travel} H</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
