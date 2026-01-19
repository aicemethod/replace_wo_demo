import { useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa'
import DatePicker from 'react-datepicker'
import { detailData } from './data'
import './TimeEntryView.css'

const formatDate = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`

export default function TimeEntryView() {
  const [date, setDate] = useState<Date | null>(new Date(2024, 0, 15))
  
  const filtered = useMemo(() => {
    if (!date) return detailData
    const target = formatDate(date)
    return detailData.filter(r => r.startTime.split(' ')[0] === target || r.endTime.split(' ')[0] === target)
  }, [date])

  const totalHours = filtered.reduce((s, r) => s + r.actualHour, 0)
  const changeDate = (days: number) => date && setDate(new Date(date.getTime() + days * 86400000))

  return (
    <div className="time-entry-view">
      <div className="detail-section">
        <div className="detail-header">
          <span className="detail-title">Time Entry 明細</span>
        </div>
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
                    <tr className="total-row"><td>合計</td><td></td><td></td><td></td><td></td><td>{totalHours} hours</td><td></td></tr>
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
