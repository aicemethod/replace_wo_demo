// src/App.tsx
import { Header, Sidebar, Footer, ContentHeader, CalendarView, FavoriteTaskModal, TimeEntryModal, UserListModal } from "./ui";
import { useAppController } from "./hooks/useAppController";
import { UserListProvider } from "./context/UserListContext";
import { FavoriteTaskProvider } from "./context/FavoriteTaskContext";
import { formatToday } from "./utils/dateFormatter";
import { convertWorkOrdersToOptions } from "./utils/modalHelpers";
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

        {/* 中央：サイドバー＋カレンダー */}
        <div className="content-middle">
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
              events={events}
              isSubgrid={isSubgrid}
            />
          </div>
        </div>

        {/* フッター */}
        <Footer
          onOpenUserList={() => setIsUserListModalOpen(true)}
          onOpenFavoriteTask={() => setIsFavoriteTaskModalOpen(true)}
        />
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
