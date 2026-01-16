import { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaChevronDown } from 'react-icons/fa';
import Button from '../../../../../components/elements/Button';
import './TimeEntryDateInput.css';

type TimeEntryDateInputProps = {
  label: string;
  value: Date;
  onChange: (nextValue: Date) => void;
};

function TimeEntryDateInput({ value, onChange }: TimeEntryDateInputProps) {
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

  const displayDate = formatDisplayDate(value);
  const calendarDate = getMonthDate(value, monthOffset);
  const calendarDays = getCalendarDays(calendarDate);

  const handleSelect = (day: Date) => {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div className="time-entry-date-input-control" ref={wrapperRef}>
      {/* <label className="time-entry-field-label">{label}</label> */}
      <Button
        variant="static"
        color="secondary"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`time-entry-date-trigger ${isOpen ? 'open' : ''}`}
        aria-expanded={isOpen}
      >
        <FaCalendarAlt className="time-entry-date-icon" />
        <span className={`time-entry-date-text ${!displayDate ? 'placeholder' : ''}`}>
          {displayDate || '日付を選択'}
        </span>
        <FaChevronDown className={`time-entry-date-arrow ${isOpen ? 'open' : ''}`} size={12} />
      </Button>
      <div className={`time-entry-calendar ${isOpen ? 'open' : ''}`}>
        <div className="time-entry-calendar-header">
          <Button
            variant="static"
            color="secondary"
            aria-label="前の月"
            onClick={() => setMonthOffset((prev) => prev - 1)}
            className="time-entry-calendar-nav"
          >
            ‹
          </Button>
          <span className="time-entry-calendar-month">
            {calendarDate.getFullYear()}年 {calendarDate.getMonth() + 1}月
          </span>
          <Button
            variant="static"
            color="secondary"
            aria-label="次の月"
            onClick={() => setMonthOffset((prev) => prev + 1)}
            className="time-entry-calendar-nav"
          >
            ›
          </Button>
        </div>
        <div className="time-entry-calendar-grid">
          {['日', '月', '火', '水', '木', '金', '土'].map((weekday) => (
            <span key={weekday} className="time-entry-calendar-weekday">
              {weekday}
            </span>
          ))}
          {calendarDays.map((day) => {
            const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
            const isSelected = isSameDay(day, value);
            return (
              <button
                key={day.toISOString()}
                type="button"
                className={`time-entry-calendar-day ${isSelected ? 'selected' : ''} ${
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
  return `${date.getFullYear()}年 ${(date.getMonth() + 1).toString().padStart(2, '0')}月 ${date
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

export default TimeEntryDateInput;

