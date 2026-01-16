import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import jaCoreLocale from '@fullcalendar/core/locales/ja';
import { addDays, endOfDay, format } from 'date-fns';
import { ja as jaDateLocale } from 'date-fns/locale';
import type { TimeEntryContext } from '../../../types/timeEntry';
import { useCalendarView } from './useCalendarView';
import './CalendarView.css';

type CalendarViewProps = {
  currentDate: Date;
  dateView: 'day' | '3day' | 'week';
  viewMode: 'user' | 'task';
  onEntryTrigger: (context: TimeEntryContext) => void;
  onDuplicateTrigger?: (context: TimeEntryContext) => void;
};

function CalendarView({
  currentDate,
  dateView,
  viewMode,
  onEntryTrigger,
  onDuplicateTrigger,
}: CalendarViewProps) {
  const {
    calendarRef,
    scrollTime,
    events,
    eventClassNames,
    eventContent,
    handleDateClick,
    handleSelect,
    handleEventDrop,
    handleEventResize,
    handleEventDidMount,
    handleEventClick,
  } = useCalendarView({
    currentDate,
    dateView,
    viewMode,
    onEntryTrigger,
    onDuplicateTrigger,
  });

  return (
    <div className="calendar-view">
      <div className="calendar-shell">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locales={[jaCoreLocale]}
          locale="ja"
          timeZone="Asia/Tokyo"
          firstDay={1}
          headerToolbar={false}
          height="100%"
          expandRows={false}
          scrollTime={scrollTime}
          slotDuration="00:30:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          nowIndicator
          dayMaxEvents
          events={events}
          selectable
          selectMirror
          allDaySlot={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          eventClassNames={eventClassNames}
          eventContent={eventContent}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventOverlap={false}
          eventMaxStack={3}
          dateClick={(arg) => handleDateClick(arg.date)}
          select={handleSelect}
          editable={true}
          eventStartEditable={true}
          eventDurationEditable={true}
          eventResizableFromStart={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDidMount={handleEventDidMount}
          eventClick={handleEventClick}
          dayHeaderContent={(arg) => (
            <div className="fc-day-header">
              <span className="fc-day-header-date">{format(arg.date, 'MM月dd日')}</span>
              <span className="fc-day-header-weekday">
                {format(arg.date, '(EEE)', { locale: jaDateLocale })}
              </span>
            </div>
          )}
          views={{
            threeDay: {
              type: 'timeGrid',
              duration: { days: 3 },
              buttonText: '3日',
              firstDay: 1,
            },
            timeGridWeek: {
              type: 'timeGridWeek',
              duration: { days: 7 },
              buttonText: '週',
              firstDay: 1,
            },
            timeGridDay: {
              type: 'timeGridDay',
              firstDay: 1,
            },
            dayGridMonth: {
              type: 'dayGridMonth',
              firstDay: 1,
            },
          }}
          stickyHeaderDates
          weekends
          progressiveEventRendering
          slotEventOverlap={false}
          validRange={{
            start: addDays(endOfDay(new Date()), -90),
            end: addDays(new Date(), 90),
          }}
        />
      </div>
    </div>
  );
}

export default CalendarView;


