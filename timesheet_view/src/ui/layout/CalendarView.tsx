import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventInput, DateSelectArg, EventClickArg, EventContentArg, EventApi } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import enLocale from "@fullcalendar/core/locales/en-gb";
import { FaCopy } from "react-icons/fa";
import "../styles/layout/CalendarView.css";
import { useTranslation } from "react-i18next";

/** カレンダービューモード */
export type CalendarViewMode = "稼働日" | "週";

/** CalendarView コンポーネントの Props */
export type CalendarViewProps = {
    viewMode: CalendarViewMode;
    currentDate: Date;
    onDateChange?: (newDate: Date) => void;
    onDateClick?: (range: { start: Date; end: Date }) => void;
    onEventClick?: (eventData: {
        id: string;
        title: string;
        start: Date;
        end: Date;
        extendedProps?: Record<string, any>;
    }) => void;
    onEventDuplicate?: (eventData: {
        id: string;
        title: string;
        start: Date;
        end: Date;
        extendedProps?: Record<string, any>;
    }) => void;
    onEventDelete?: (id: string) => void;
    onHeaderDateSelect?: (date: Date | null) => void;
    events: EventInput[];
    isSubgrid?: boolean;
};

/**
 * FullCalendar ラッパーコンポーネント
 * - Dataverse の個人言語設定に応じた多言語対応
 * - 週／3日／1日の切替
 * - イベントクリック／日付選択ハンドリング
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
    viewMode,
    currentDate,
    onDateChange,
    onDateClick,
    onEventClick,
    onEventDuplicate,
    onEventDelete,
    onHeaderDateSelect,
    events,
    isSubgrid = false,
}) => {
    const calendarRef = useRef<FullCalendar>(null);
    const isInternalUpdateRef = useRef(false);
    const { i18n, t } = useTranslation();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; eventId: string } | null>(null);
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

    /** 言語に応じた FullCalendar locale の選択 */
    const currentLocale = i18n.language.startsWith("ja") ? jaLocale : enLocale;

    /** currentDate が変化した際にカレンダー表示を同期 */
    useEffect(() => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        const displayedDate = api.getDate();
        if (displayedDate.toDateString() !== currentDate.toDateString()) {
            isInternalUpdateRef.current = true;
            api.gotoDate(currentDate);
            // 次のレンダリングサイクルでフラグをリセット
            setTimeout(() => {
                isInternalUpdateRef.current = false;
            }, 0);
        }
    }, [currentDate]);

    const toDateKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        const api = calendarRef.current?.getApi();
        const rootEl = api?.el;
        if (!rootEl) return;

        rootEl.querySelectorAll(".fc-timegrid-col.is-selected-day").forEach((el) => {
            el.classList.remove("is-selected-day");
        });
        rootEl.querySelectorAll(".fc-col-header-cell.is-selected-day").forEach((el) => {
            el.classList.remove("is-selected-day");
        });

        if (!selectedDateKey) return;

        rootEl
            .querySelectorAll(`.fc-timegrid-col[data-date="${selectedDateKey}"]`)
            .forEach((el) => el.classList.add("is-selected-day"));
        rootEl
            .querySelectorAll(`.fc-col-header-cell[data-date="${selectedDateKey}"]`)
            .forEach((el) => el.classList.add("is-selected-day"));
    }, [selectedDateKey]);

    useEffect(() => {
        const handleDocClick = (e: MouseEvent) => {
            const rootEl = calendarRef.current?.getApi().el;
            if (!rootEl) return;
            const target = e.target as HTMLElement;
            if (target.closest(".modal-content")) return;
            if (target.closest(".tab-header")) return;
            if (target.closest(".fc-col-header-cell")) return;
            setSelectedDateKey(null);
            onHeaderDateSelect?.(null);
        };

        document.addEventListener("click", handleDocClick);
        return () => {
            document.removeEventListener("click", handleDocClick);
        };
    }, []);

    /** viewMode に応じて表示モード切替 */
    useEffect(() => {
        const api = calendarRef.current?.getApi();
        if (!api) return;

        const modeToView = {
            "稼働日": "timeGridWeekdays",
            "週": "timeGridWeek",
        } as const;

        isInternalUpdateRef.current = true;
        api.changeView(modeToView[viewMode]);
        // 次のレンダリングサイクルでフラグをリセット
        setTimeout(() => {
            isInternalUpdateRef.current = false;
        }, 0);
    }, [viewMode]);

    /** 日付範囲選択時 */
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        onDateClick?.({ start: selectInfo.start, end: selectInfo.end });
    };

    /** イベントクリック時 */
    const handleEventClick = (clickInfo: EventClickArg) => {
        const { id, title, start, end, extendedProps } = clickInfo.event;
        onEventClick?.({
            id: String(id),
            title: String(title),
            start: start as Date,
            end: end as Date,
            extendedProps,
        });
    };

    /** イベントコンテンツのカスタマイズ（コピーアイコン追加） */
    const renderEventContent = (arg: EventContentArg) => {
        return (
            <div className="fc-event-content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="fc-event-title">{arg.event.title}</span>
                {onEventDuplicate && (
                    <FaCopy
                        className="event-copy-icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            const { id, title, start, end, extendedProps } = arg.event;
                            onEventDuplicate({
                                id: String(id),
                                title: String(title),
                                start: start as Date,
                                end: end as Date,
                                extendedProps,
                            });
                        }}
                        style={{ marginLeft: '4px', cursor: 'pointer', flexShrink: 0 }}
                    />
                )}
            </div>
        );
    };

    /** 表示範囲変更時（日付が変わった時） */
    const handleDatesSet = (info: any) => {
        // プログラムによる内部更新の場合は無視
        if (isInternalUpdateRef.current) {
            return;
        }

        const newDate = info.start;
        if (
            onDateChange &&
            newDate.toDateString() !== currentDate.toDateString()
        ) {
            onDateChange(newDate);
        }
    };

    /** イベントマウント時に右クリックイベントを追加 */
    const handleEventDidMount = (arg: { event: EventApi; el: HTMLElement }) => {
        const { event, el } = arg;
        
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                eventId: String(event.id),
            });
        };

        el.addEventListener('contextmenu', handleContextMenu);

        // クリーンアップ関数を返す（FullCalendarが自動的に呼び出す）
        return () => {
            el.removeEventListener('contextmenu', handleContextMenu);
        };
    };

    /** メニュー外をクリックしたら閉じる */
    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu(null);
        };

        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [contextMenu]);

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
                height={isSubgrid ? "600px" : "100%"}
                nowIndicator
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                }}
                dayHeaderFormat={{
                    day: 'numeric',
                    weekday: 'short'
                }}
                dayHeaderDidMount={(arg) => {
                    arg.el.style.cursor = "pointer";
                    arg.el.onclick = () => {
                        setSelectedDateKey(toDateKey(arg.date));
                        onHeaderDateSelect?.(arg.date);
                    };
                }}
                locale={currentLocale}
                firstDay={1}
                initialDate={currentDate}
                views={{
                    timeGridWeekdays: {
                        type: "timeGrid",
                        duration: { days: 5 },
                        hiddenDays: [0, 6], // 日曜日(0)と土曜日(6)を非表示
                        buttonText: i18n.language.startsWith("ja") ? "稼働日" : "Mon-Fri",
                    },
                    timeGridThreeDay: {
                        type: "timeGrid",
                        duration: { days: 3 },
                        //  i18n連動：FullCalendar内部ボタンも翻訳
                        buttonText: i18n.language.startsWith("ja") ? "3日" : "3 Days",
                    },
                }}
                eventClassNames={(arg) =>
                    arg.event.extendedProps?.isTargetWO ? ["highlight-event"] : []
                }
                eventContent={renderEventContent}
                eventDidMount={handleEventDidMount}
                datesSet={handleDatesSet}
            />
            {contextMenu && (
                <div
                    className="event-context-menu"
                    style={{
                        position: 'fixed',
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                        zIndex: 10000,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {onEventDuplicate && (
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                const event = events.find(e => String(e.id) === contextMenu.eventId);
                                if (event && event.start != null && event.end != null) {
                                    const parseDate = (date: string | number | number[] | Date): Date => {
                                        if (date instanceof Date) {
                                            return date;
                                        }
                                        if (Array.isArray(date)) {
                                            // number[]形式: [year, month, day] または [year, month, day, hour, minute]
                                            return new Date(date[0], date[1] ?? 0, date[2] ?? 1, date[3] ?? 0, date[4] ?? 0);
                                        }
                                        return new Date(date);
                                    };
                                    onEventDuplicate({
                                        id: String(event.id),
                                        title: String(event.title || ''),
                                        start: parseDate(event.start),
                                        end: parseDate(event.end),
                                        extendedProps: event.extendedProps,
                                    });
                                }
                                setContextMenu(null);
                            }}
                        >
                            {t("timeEntryModal.duplicate") || "複製"}
                        </div>
                    )}
                    {onEventDelete && (
                        <div
                            className="context-menu-item"
                            onClick={() => {
                                onEventDelete(contextMenu.eventId);
                                setContextMenu(null);
                            }}
                        >
                            {t("timeEntryModal.delete") || "削除"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
