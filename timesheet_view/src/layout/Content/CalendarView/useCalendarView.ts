import { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import type { EventApi, EventInput, DateSelectArg, EventClickArg, EventDropArg, EventResizeArg, EventMountArg } from '@fullcalendar/core';
import { addDays, setHours, setMinutes, startOfWeek } from 'date-fns';
import type { TimeEntryContext } from '../../../types/timeEntry';
import { CALENDAR_EVENTS } from '../../../testdata/calendarEvents';

export const viewMap = {
  day: 'timeGridDay',
  '3day': 'threeDay',
  week: 'timeGridWeek',
} as const;

const eventPalette: Record<string, string> = {
  user: 'fc-event-user',
  task: 'fc-event-task',
};

// 日本時間に変換する共通関数
export const convertToJST = (date: Date | null): Date | undefined => {
  if (!date) return undefined;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return new Date(year, month, day, hours, minutes, seconds);
};

type UseCalendarViewProps = {
  currentDate: Date;
  dateView: 'day' | '3day' | 'week';
  viewMode: 'user' | 'task';
  onEntryTrigger: (context: TimeEntryContext) => void;
  onDuplicateTrigger?: (context: TimeEntryContext) => void;
};

export function useCalendarView({
  currentDate,
  dateView,
  viewMode,
  onEntryTrigger,
  onDuplicateTrigger,
}: UseCalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  // 現在時刻をHH:mm:ss形式の文字列に変換
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const scrollTime = useMemo(() => getCurrentTimeString(), []);

  useEffect(() => {
    // flushSync警告を避けるため、非同期で実行
    queueMicrotask(() => {
      const api = calendarRef.current?.getApi();
      if (!api) return;

      const desiredView = viewMap[dateView];
      if (api.view.type !== desiredView) {
        api.changeView(desiredView);
      }

      // 週ビューの場合、その週の月曜日に調整して一番左を月曜日に固定
      // 3日表示の場合は、currentDateをそのまま使用して3日単位で移動できるようにする
      let targetDate = currentDate;
      if (dateView === 'week') {
        const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
        targetDate = monday;
      }
      // 3日表示の場合は、currentDateをそのまま使用

      api.gotoDate(targetDate);
    });
  }, [currentDate, dateView]);

  const createInitialEvents = useMemo(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    const createDate = (dayOffset: number, hour: number, minute = 0) =>
      setMinutes(setHours(addDays(monday, dayOffset), hour), minute);

    const events: EventInput[] = CALENDAR_EVENTS.map((eventData) => {
      const start = createDate(eventData.dayOffset, eventData.hour, eventData.minute ?? 0);
      const durationHours = eventData.durationHours ?? 1;
      const durationMinutes = eventData.durationMinutes ?? 0;
      const totalMinutes = durationHours * 60 + durationMinutes;
      const end = new Date(start.getTime() + totalMinutes * 60 * 1000);

      return {
        id: eventData.id,
        title: eventData.title,
        start,
        end,
        extendedProps: { category: eventData.category },
      };
    });

    // viewModeに応じてフィルタリング
    if (viewMode === 'task') {
      return events.filter((event) => event.extendedProps?.category === 'task');
    }
    return events;
  }, [currentDate, viewMode]);

  const [events, setEvents] = useState<EventInput[]>(createInitialEvents);

  useEffect(() => {
    setEvents(createInitialEvents);
  }, [createInitialEvents]);

  const eventClassNames = ({ event }: { event: EventApi }) => {
    const category = event.extendedProps.category as string;
    return ['fc-event-modern', eventPalette[category] ?? eventPalette.user];
  };

  const eventContent = ({ event }: { event: EventApi }) => {
    // イベントのタイトルを表示
    return { html: `<div class="fc-event-title">${event.title}</div>` };
  };

  const handleDateClick = (date: Date) => {
    onEntryTrigger({ start: date, source: 'date' });
  };

  const handleSelect = (arg: DateSelectArg) => {
    onEntryTrigger({
      start: convertToJST(arg.start),
      end: convertToJST(arg.end),
      source: 'range',
    });
  };

  const handleEventDrop = (arg: EventDropArg) => {
    // イベントのドラッグ＆ドロップ時の処理
    // FullCalendarが自動的に時刻を更新するため、そのまま使用
    const eventId = arg.event.id;
    const newStart = arg.event.start ? new Date(arg.event.start) : null;
    const newEnd = arg.event.end ? new Date(arg.event.end) : null;

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
            ...event,
            start: newStart ?? event.start,
            end: newEnd ?? event.end,
          }
          : event,
      ),
    );
  };

  const handleEventResize = (arg: EventResizeArg) => {
    // イベントのリサイズ時の処理
    // FullCalendarが自動的に時刻を更新するため、そのまま使用
    const eventId = arg.event.id;
    const newStart = arg.event.start ? new Date(arg.event.start) : null;
    const newEnd = arg.event.end ? new Date(arg.event.end) : null;

    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
            ...event,
            start: newStart ?? event.start,
            end: newEnd ?? event.end,
          }
          : event,
      ),
    );
  };

  const handleEventDidMount = (arg: EventMountArg) => {
    // 複製ボタンを追加
    if (onDuplicateTrigger) {
      const eventEl = arg.el;
      const titleEl = eventEl.querySelector('.fc-event-title');
      if (titleEl) {
        // 複製ボタンを作成
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'fc-event-duplicate-btn';
        duplicateBtn.type = 'button';
        duplicateBtn.setAttribute('aria-label', '複製');
        duplicateBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 448 512" fill="currentColor">
            <path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"/>
          </svg>
        `;

        // クリックイベントを設定
        duplicateBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const start = convertToJST(arg.event.start) ?? currentDate;
          const end = convertToJST(arg.event.end);
          onDuplicateTrigger({
            start,
            end,
            source: 'event',
            title: arg.event.title,
            eventId: arg.event.id,
          });
        });

        // イベント要素に追加（右上に配置）
        eventEl.appendChild(duplicateBtn);
      }
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    // 複製ボタンがクリックされた場合は処理をスキップ
    const target = arg.jsEvent.target as HTMLElement;
    if (target.closest('.fc-event-duplicate-btn')) {
      return;
    }
    // selectイベントと同じ変換処理を適用
    const start = convertToJST(arg.event.start) ?? currentDate;
    const end = convertToJST(arg.event.end);
    onEntryTrigger({
      start,
      end,
      source: 'event',
      title: arg.event.title,
    });
  };

  return {
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
  };
}
