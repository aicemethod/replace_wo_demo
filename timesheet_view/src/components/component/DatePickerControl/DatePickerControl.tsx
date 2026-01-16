import { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import './DatePickerControl.css';

type DatePickerControlProps = {
  selectedDate: Date;
  onChange: (date: Date) => void;
};

function DatePickerControl({ selectedDate, onChange }: DatePickerControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayDate = formatDisplayDate(selectedDate);
  const calendarDate = getMonthDate(selectedDate, monthOffset);
  const calendarDays = getCalendarDays(calendarDate);

  const handleSelect = (day: Date) => {
    const next = new Date(selectedDate);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div className="date-picker-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`date-button custom-date-input ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="作業対象日を選択"
      >
        <span className="date-button-text">{displayDate}</span>
        <FaCalendarAlt className="date-button-icon" />
      </button>
      <div className={`custom-date-picker ${isOpen ? 'open' : ''}`}>
        <div className="custom-date-picker-header">
          <button
            type="button"
            aria-label="前の月"
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="custom-date-picker-nav"
          >
            ‹
          </button>
          <span className="custom-date-picker-month">
            {calendarDate.getFullYear()}年 {calendarDate.getMonth() + 1}月
          </span>
          <button
            type="button"
            aria-label="次の月"
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="custom-date-picker-nav"
          >
            ›
          </button>
        </div>
        <div className="custom-date-picker-grid">
          {['日', '月', '火', '水', '木', '金', '土'].map((weekday) => (
            <span key={weekday} className="custom-date-picker-weekday">
              {weekday}
            </span>
          ))}
          {calendarDays.map((day) => {
            const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={`custom-date-picker-day ${isSelected ? 'selected' : ''} ${
                  isCurrentMonth ? '' : 'muted'
                }`}
                onClick={() => handleSelect(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDisplayDate(date: Date) {
  if (!date) return '';
  return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date
    .getDate()
    .toString()
    .padStart(2, '0')}日`;
}

function getMonthDate(base: Date, offset: number) {
  const date = new Date(base);
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  return date;
}

function getCalendarDays(monthDate: Date) {
  const start = new Date(monthDate);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default DatePickerControl;

