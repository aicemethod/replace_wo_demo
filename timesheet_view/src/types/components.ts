/**
 * コンポーネントのProps型定義
 * 各コンポーネントのインターフェースを集約
 */

import type { WorkOrder, MainTab, ViewMode, DateTimeRange, Event, UserSortKey, TaskSortKey, SearchType, Option, TimeEntryData, ButtonColor, ButtonType, InputType } from "./index";

/** Header Props */
export type HeaderProps = {
    workOrders?: WorkOrder[];
    selectedWO: string;
    setSelectedWO: (id: string) => void;
};

/** ContentHeader Props */
export type ContentHeaderProps = {
    mainTab: MainTab;
    setMainTab: (tab: MainTab) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    formattedToday: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onCreateNew: () => void;
};

/** Sidebar Props */
export type SidebarProps = {
    mainTab: MainTab;
};

/** CalendarView Props */
export type CalendarViewProps = {
    viewMode: ViewMode;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onDateClick: (range: DateTimeRange) => void;
    onEventClick: (event: Event) => void;
    events: Event[];
};

/** TimeEntryModal Props */
export type TimeEntryModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TimeEntryData) => void;
    onDelete: (id: string) => void;
    onDuplicate: (data: TimeEntryData) => void;
    selectedDateTime: DateTimeRange | null;
    selectedEvent: Event | null;
    woOptions: Option[];
    maincategoryOptions: Option[];
    timecategoryOptions: Option[];
    paymenttypeOptions: Option[];
    timezoneOptions: Option[];
};

/** FavoriteTaskModal Props */
export type FavoriteTaskModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tasks: string[]) => void;
};

/** UserListModal Props */
export type UserListModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (users: string[]) => void;
};

/** Footer Props */
export type FooterProps = {
    onOpenUserList: () => void;
    onOpenFavoriteTask: () => void;
};

// コンポーネント用の共通型定義
export type ButtonProps = {
    label: string;
    onClick?: () => void;
    type?: ButtonType;
    color?: ButtonColor;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
};

export type InputProps = {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    type?: InputType;
    disabled?: boolean;
    className?: string;
    width?: string;
    suffix?: React.ReactNode;
    min?: string | number;
    max?: string | number;
};

export type SelectProps = {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export type TabsProps = {
    tabs: Option[];
    activeTab: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
};

export type TextareaProps = {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    readOnly?: boolean;
    showCount?: boolean;
    maxLength?: number;
    className?: string;
    onClick?: () => void;
};

// 型の再エクスポート（必要に応じて）
export type { UserSortKey, TaskSortKey, SearchType, MainTab, ViewMode, Option, TimeEntryData, ButtonColor, ButtonType, InputType };
