import { useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import { summaryData, detailData } from './data'
import './TimeEntryView.css'

const formatDate = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default function TimeEntryView() {
  const [date, setDate] = useState<Date | null>(new Date(2024, 0, 15))
  const [isLoading, setIsLoading] = useState(false)

  const filtered = useMemo(() => {
    if (!date) return detailData
    const target = formatDate(date).split(' ')[0]
    return detailData.filter(r => r.startTime.split(' ')[0] === target || r.endTime.split(' ')[0] === target)
  }, [date])

  const totals = {
    person: summaryData.reduce((s, r) => s + r.personCount, 0),
    work: summaryData.reduce((s, r) => s + r.totalWorkHours, 0),
    travel: summaryData.reduce((s, r) => s + r.totalTravelHours, 0),
    hours: filtered.reduce((s, r) => s + r.actualHour, 0)
  }

  const changeDate = (days: number) => date && setDate(new Date(date.getTime() + days * 86400000))
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

      <div className="detail-section">
        <div className="detail-controls">
          <div className="date-controls">
            <button onClick={() => changeDate(-1)} className="date-btn"><FaChevronLeft /><span>Prev</span></button>
            <div className="date-picker-wrapper">
              <DatePicker selected={date} onChange={setDate} dateFormat="yyyy/MM/dd" className="date-picker-input" wrapperClassName="date-picker" />
              <FaCalendarAlt className="calendar-icon" />
            </div>
            <button onClick={() => changeDate(1)} className="date-btn"><span>Next</span><FaChevronRight /></button>
            <label className="checkbox-label"><input type="checkbox" defaultChecked className="checkbox" /><span>全日付選択</span></label>
          </div>
          <span className="count-badge">{filtered.length}件</span>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table className="detail-table">
              <thead>
                <tr><th>社員番号</th><th>氏名</th><th>Task</th><th>開始時間</th><th>終了時間</th><th>Actual Hour</th><th>Location（Time Zone）</th></tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  <>
                    {filtered.map((r, i) => (
                      <tr key={i}><td>{r.employeeNumber}</td><td>{r.name}</td><td>{r.task}</td><td>{r.startTime}</td><td>{r.endTime}</td><td>{r.actualHour}</td><td>{r.location}</td></tr>
                    ))}
                    <tr className="total-row"><td>合計</td><td></td><td></td><td></td><td></td><td>{totals.hours} hours</td><td></td></tr>
                  </>
                ) : <tr><td colSpan={7}></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
