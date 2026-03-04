import { useEffect, useRef, useState, type JSX } from 'react'
import FullCalendar from '@fullcalendar/react'
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventInput,
  EventMountArg,
} from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import jaLocale from '@fullcalendar/core/locales/ja'
import timeGridPlugin from '@fullcalendar/timegrid'
import { FaCopy } from 'react-icons/fa'
import './CalendarView.css'

export type CalendarViewMode = '稼働日' | '週'

type CalendarEventData = {
  id: string
  title: string
  start: Date
  end: Date
  extendedProps?: Record<string, unknown>
}

export type CalendarViewProps = {
  viewMode?: CalendarViewMode
  currentDate: Date
  onDateChange?: (newDate: Date) => void
  onDateClick?: (range: { start: Date; end: Date }) => void
  onEventClick?: (eventData: CalendarEventData) => void
  onEventDuplicate?: (eventData: CalendarEventData) => void
  onEventDelete?: (id: string) => void
  onHeaderDateSelect?: (date: Date | null) => void
  events?: EventInput[]
  isSubgrid?: boolean
}

const toDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseEventDate = (date: string | number | Date | number[]): Date => {
  if (date instanceof Date) return date
  if (Array.isArray(date)) {
    return new Date(date[0], (date[1] ?? 1) - 1, date[2] ?? 1, date[3] ?? 0, date[4] ?? 0)
  }
  return new Date(date)
}

export function CalendarView({
  viewMode = '週',
  currentDate,
  onDateChange,
  onDateClick,
  onEventClick,
  onEventDuplicate,
  onEventDelete,
  onHeaderDateSelect,
  events = [],
  isSubgrid = false,
}: CalendarViewProps): JSX.Element {
  const calendarRef = useRef<FullCalendar>(null)
  const isInternalUpdateRef = useRef(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    eventId: string
  } | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api) return

    if (api.getDate().toDateString() !== currentDate.toDateString()) {
      isInternalUpdateRef.current = true
      api.gotoDate(currentDate)
      setTimeout(() => {
        isInternalUpdateRef.current = false
      }, 0)
    }
  }, [currentDate])

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api) return

    isInternalUpdateRef.current = true
    api.changeView(viewMode === '稼働日' ? 'timeGridWeekdays' : 'timeGridWeek')
    setTimeout(() => {
      isInternalUpdateRef.current = false
    }, 0)
  }, [viewMode])

  useEffect(() => {
    const rootEl = (calendarRef.current?.getApi() as { el?: HTMLElement } | undefined)?.el
    if (!rootEl) return

    rootEl.querySelectorAll<HTMLElement>('.fc-timegrid-col.is-selected-day').forEach((element) => {
      element.classList.remove('is-selected-day')
    })
    rootEl.querySelectorAll<HTMLElement>('.fc-col-header-cell.is-selected-day').forEach((element) => {
      element.classList.remove('is-selected-day')
    })

    if (!selectedDateKey) return

    rootEl
      .querySelectorAll<HTMLElement>(`.fc-timegrid-col[data-date="${selectedDateKey}"]`)
      .forEach((element) => element.classList.add('is-selected-day'))
    rootEl
      .querySelectorAll<HTMLElement>(`.fc-col-header-cell[data-date="${selectedDateKey}"]`)
      .forEach((element) => element.classList.add('is-selected-day'))
  }, [selectedDateKey])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.modal-content')) return
      if (target.closest('.tab-header')) return
      if (target.closest('.fc-col-header-cell')) return
      setSelectedDateKey(null)
      onHeaderDateSelect?.(null)
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [onHeaderDateSelect])

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (!contextMenu) return

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [contextMenu])

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    onDateClick?.({ start: selectInfo.start, end: selectInfo.end })
  }

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { id, title, start, end, extendedProps } = clickInfo.event
    if (!start || !end) return

    onEventClick?.({
      id: String(id),
      title: String(title),
      start,
      end,
      extendedProps: extendedProps as Record<string, unknown>,
    })
  }

  const renderEventContent = (arg: EventContentArg) => (
    <div className="fc-event-content-wrapper">
      <span className="fc-event-title">{arg.event.title}</span>
      {onEventDuplicate && (
        <FaCopy
          className="event-copy-icon"
          onClick={(event) => {
            event.stopPropagation()
            const { id, title, start, end, extendedProps } = arg.event
            if (!start || !end) return

            onEventDuplicate({
              id: String(id),
              title: String(title),
              start,
              end,
              extendedProps: extendedProps as Record<string, unknown>,
            })
          }}
        />
      )}
    </div>
  )

  const handleDatesSet = (info: DatesSetArg) => {
    if (isInternalUpdateRef.current) return
    if (info.start.toDateString() !== currentDate.toDateString()) {
      onDateChange?.(info.start)
    }
  }

  const handleEventDidMount = (arg: EventMountArg) => {
    const { event, el } = arg

    const handleContextMenu = (mouseEvent: MouseEvent) => {
      mouseEvent.preventDefault()
      mouseEvent.stopPropagation()

      setContextMenu({
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
        eventId: String(event.id),
      })
    }

    el.addEventListener('contextmenu', handleContextMenu)

    return () => {
      el.removeEventListener('contextmenu', handleContextMenu)
    }
  }

  return (
    <div className={`calendar-wrapper ${isSubgrid ? 'is-subgrid' : ''}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        selectable
        selectMirror
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={events}
        allDaySlot={false}
        slotDuration="00:30:00"
        height={isSubgrid ? '600px' : '100%'}
        nowIndicator
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
        dayHeaderFormat={{ day: 'numeric', weekday: 'short' }}
        dayHeaderDidMount={(arg) => {
          arg.el.style.cursor = 'pointer'
          arg.el.onclick = () => {
            setSelectedDateKey(toDateKey(arg.date))
            onHeaderDateSelect?.(arg.date)
          }
        }}
        locale={jaLocale}
        firstDay={1}
        initialDate={currentDate}
        views={{
          timeGridWeekdays: {
            type: 'timeGrid',
            duration: { days: 5 },
            hiddenDays: [0, 6],
            buttonText: '稼働日',
          },
        }}
        eventClassNames={(arg) =>
          arg.event.extendedProps?.isTargetWO ? ['highlight-event'] : []
        }
        eventContent={renderEventContent}
        eventDidMount={handleEventDidMount}
        datesSet={handleDatesSet}
      />

      {contextMenu && (
        <div
          className="event-context-menu"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(event) => event.stopPropagation()}
        >
          {onEventDuplicate && (
            <div
              className="context-menu-item"
              onClick={() => {
                const event = events.find((item) => String(item.id) === contextMenu.eventId)
                if (event?.start == null || event.end == null) return

                onEventDuplicate({
                  id: String(event.id),
                  title: String(event.title || ''),
                  start: parseEventDate(event.start),
                  end: parseEventDate(event.end),
                  extendedProps: event.extendedProps as Record<string, unknown> | undefined,
                })
                setContextMenu(null)
              }}
            >
              複製
            </div>
          )}

          {onEventDelete && (
            <div
              className="context-menu-item"
              onClick={() => {
                onEventDelete(contextMenu.eventId)
                setContextMenu(null)
              }}
            >
              削除
            </div>
          )}
        </div>
      )}
    </div>
  )
}
