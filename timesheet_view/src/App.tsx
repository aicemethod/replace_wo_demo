// src/App.tsx
import { useState, useMemo } from "react";
import { Header, Sidebar, ContentHeader, WorkTimeInfo, CalendarView, FavoriteTaskModal, TimeEntryModal, UserListModal, Spinner } from "./ui";
import { useAppController } from "./hooks/useAppController";
import { UserListProvider } from "./context/UserListContext";
import { FavoriteTaskProvider } from "./context/FavoriteTaskContext";
import { formatToday } from "./utils/dateFormatter";
import { convertWorkOrdersToOptions } from "./utils/modalHelpers";
import type { EventInput } from "@fullcalendar/core";
import "./App.css";

/**
 * メインアプリケーションコンポーネント
 * - タイムシート管理アプリケーションのメインUI
 * - Context Providerでラップされた状態管理
 */
export default function App() {
  return (
    <UserListProvider>
      <FavoriteTaskProvider>
        <TimesheetApp />
      </FavoriteTaskProvider>
    </UserListProvider>
  );
}

/**
 * タイムシートアプリケーションのメインコンポーネント
 */
function TimesheetApp() {
  const {
    workOrders,
    optionSets,
    events,
    selectedWO,
    setSelectedWO,
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    mainTab,
    setMainTab,
    isTimeEntryModalOpen,
    setIsTimeEntryModalOpen,
    isFavoriteTaskModalOpen,
    setIsFavoriteTaskModalOpen,
    isUserListModalOpen,
    setIsUserListModalOpen,
    selectedDateTime,
    setSelectedDateTime,
    selectedEvent,
    setSelectedEvent,
    handleTimeEntrySubmit,
    handleEventClick,
    handleDeleteTimeEntry,
    handleDuplicate,
    openNewTimeEntry,
    handleSaveFavoriteTasks,
    handleSaveUserList,
    handlePrev,
    handleNext,
    handleToday,
    isSubgrid,
  } = useAppController();

  /** 休憩時間のイベント（クライアント側のみ） */
  const [breakTimeEvents, setBreakTimeEvents] = useState<EventInput[]>([]);
  /** 固定時間挿入のローディング状態 */
  const [isBreakTimeLoading, setIsBreakTimeLoading] = useState(false);

  /** 休憩時間挿入ハンドラ（クライアント側のみ） */
  const handleInsertBreakTime = (breakEvents: EventInput[]) => {
    if (breakEvents.length === 0) return;

    // 挿入するイベントのタイトルを取得（休憩1または休憩2）
    const insertTitle = breakEvents[0]?.title;

    // 日付を文字列化して比較するヘルパー関数（時刻を無視）
    const getDateKey = (date: Date | string | number): string => {
      const d = date instanceof Date ? date : new Date(date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    };

    // 日付が有効かチェックするヘルパー関数
    const isValidDate = (date: any): date is Date | string | number => {
      if (date == null) return false;
      if (date instanceof Date) return true;
      if (typeof date === "string" || typeof date === "number") return true;
      return false;
    };

    // 挿入するイベントの日付キーセットを作成
    const insertDateKeys = new Set(
      breakEvents
        .map((e) => e.start)
        .filter(isValidDate)
        .map(getDateKey)
    );

    setBreakTimeEvents((prev) => {
      // 同じタイトルかつ同じ日付の休憩時間イベントのみを削除
      const filtered = prev.filter((e) => {
        // 休憩時間イベントでない場合は保持
        if (!e.extendedProps?.isBreakTime) return true;
        // タイトルが異なる場合は保持
        if (e.title !== insertTitle) return true;
        // タイトルが同じ場合、日付が挿入対象に含まれている場合は削除
        if (!isValidDate(e.start)) return true;
        const dateKey = getDateKey(e.start);
        return !insertDateKeys.has(dateKey);
      });
      return [...filtered, ...breakEvents];
    });
  };

  /** イベントをマージ（APIから取得したイベント + 休憩時間イベント） */
  const mergedEvents = useMemo(() => {
    return [...events, ...breakTimeEvents];
  }, [events, breakTimeEvents]);

  /** 今日の日付フォーマット（例：2025/10/14） */
  const formattedToday = formatToday();

  return (
    <div className={`app-container ${isSubgrid ? 'is-subgrid-mode' : ''}`}>
      {/* ヘッダー（サブグリッドの場合は非表示） */}
      {!isSubgrid && (
        <Header
          workOrders={workOrders}
          selectedWO={selectedWO}
          setSelectedWO={setSelectedWO}
        />
      )}

      {/* メインコンテンツ */}
      <section className="content-card">
        {/* 上部ナビゲーション */}
        <ContentHeader
          mainTab={mainTab}
          setMainTab={setMainTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          formattedToday={formattedToday}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onCreateNew={openNewTimeEntry}
        />

        {/* 作業時間情報 */}
        <WorkTimeInfo
          events={events}
          currentDate={currentDate}
          viewMode={viewMode}
          onInsertBreakTime={handleInsertBreakTime}
          onLoadingChange={setIsBreakTimeLoading}
          onOpenUserList={() => setIsUserListModalOpen(true)}
          onOpenFavoriteTask={() => setIsFavoriteTaskModalOpen(true)}
        />

        {/* 中央：サイドバー＋カレンダー */}
        <div className="content-middle">
          {isBreakTimeLoading && (
            <div className="content-loading-overlay">
              <Spinner size="large" />
            </div>
          )}
          {/* Sidebar が Context からお気に入りタスクを取得 */}
          <Sidebar mainTab={mainTab} />

          <div className="content-main">
            <CalendarView
              viewMode={viewMode}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDateClick={(range) => {
                setSelectedDateTime(range);
                setSelectedEvent(null);
                setIsTimeEntryModalOpen(true);
              }}
              onEventClick={handleEventClick}
              events={mergedEvents}
              isSubgrid={isSubgrid}
            />
          </div>
        </div>

      </section>

      {/* モーダル群 */}
      <TimeEntryModal
        isOpen={isTimeEntryModalOpen}
        onClose={() => setIsTimeEntryModalOpen(false)}
        onSubmit={handleTimeEntrySubmit}
        onDelete={handleDeleteTimeEntry}
        onDuplicate={handleDuplicate}
        selectedDateTime={selectedDateTime}
        selectedEvent={selectedEvent}
        woOptions={convertWorkOrdersToOptions(workOrders)}
        maincategoryOptions={optionSets?.maincategory ?? []}
        timecategoryOptions={optionSets?.timecategory ?? []}
        paymenttypeOptions={optionSets?.paymenttype ?? []}
        timezoneOptions={optionSets?.timezone ?? []}
        isSubgrid={isSubgrid}
        selectedWO={selectedWO}
      />

      <FavoriteTaskModal
        isOpen={isFavoriteTaskModalOpen}
        onClose={() => setIsFavoriteTaskModalOpen(false)}
        onSave={handleSaveFavoriteTasks}
      />

      <UserListModal
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        onSave={handleSaveUserList}
      />
    </div>
  );
}
