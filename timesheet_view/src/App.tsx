// src/App.tsx
import { useState, useMemo, useEffect } from "react";
import { Header, Sidebar, ContentHeader, Footer, CalendarView, FavoriteTaskModal, TimeEntryModal, UserListModal, Spinner, DayCopyModal } from "./ui";
import { useAppController } from "./hooks/useAppController";
import { UserListProvider } from "./context/UserListContext";
import { FavoriteTaskProvider, useFavoriteTasks } from "./context/FavoriteTaskContext";
import { formatToday } from "./utils/dateFormatter";
import { convertWorkOrdersToOptions } from "./utils/modalHelpers";
import { getXrm } from "./utils/xrmUtils";
import type { Option } from "./types";
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
    handleEventDuplicate,
    openNewTimeEntry,
    handleSaveFavoriteTasks,
    handleSaveUserList,
    handlePrev,
    handleNext,
    handleToday,
    isSubgrid,
  } = useAppController();

  /** 固定時間挿入のローディング状態 */
  const [isBreakTimeLoading] = useState(false);
  /** ヘッダーセレクトの状態 */
  const [headerSelectValue, setHeaderSelectValue] = useState<string>("");
  /** ヘッダーセレクトのオプション */
  const [headerSelectOptions, setHeaderSelectOptions] = useState<Option[]>([]);
  /** ヘッダーセレクトのローディング状態 */
  const [isHeaderSelectLoading, setIsHeaderSelectLoading] = useState(true);
  /** サイドバーで選択されているタスク */
  const [selectedSidebarTask, setSelectedSidebarTask] = useState<string[]>([]);
  /** サイドバーで選択されているリソース（表示用文字列） */
  const [selectedSidebarResourcesText, setSelectedSidebarResourcesText] = useState<string>("");
  /** カレンダーの日付列選択状態 */
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  /** 1日コピー用モーダル */
  const [isDayCopyModalOpen, setIsDayCopyModalOpen] = useState(false);
  /** 1日コピー用のコピー元日付 */
  const [dayCopySourceDate, setDayCopySourceDate] = useState<Date | null>(null);

  /** 選択されているタスク情報を取得（最初の1つを使用） */
  const { favoriteTasks } = useFavoriteTasks();
  const selectedIndirectTask = useMemo(() => {
    if (selectedSidebarTask.length === 0 || mainTab !== "indirect") return null;
    return favoriteTasks.find(task => task.id === selectedSidebarTask[0]) || null;
  }, [selectedSidebarTask, favoriteTasks, mainTab]);

  /** Lookupデータの状態 */
  const [endUserOptions, setEndUserOptions] = useState<Option[]>([]);
  const [deviceSnOptions, setDeviceSnOptions] = useState<Option[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<Option[]>([]);
  const [woTypeOptions, setWoTypeOptions] = useState<Option[]>([]);

  /** ユーザーオプションを取得 */
  useEffect(() => {
    const loadUsers = async () => {
      setIsHeaderSelectLoading(true);
      const xrm = getXrm();
      if (!xrm?.WebApi) {
        setIsHeaderSelectLoading(false);
        return;
      }

      try {
        // ログインユーザーIDを取得
        const userId: string = xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");

        // ログインユーザーのbusinessunitidを取得
        const currentUser = await xrm.WebApi.retrieveRecord(
          "systemuser",
          userId,
          "?$select=systemuserid,fullname,_businessunitid_value"
        );

        const businessUnitId = currentUser._businessunitid_value;
        if (!businessUnitId) return;

        // businessunitidをGUID形式に変換（波括弧付き）
        const businessUnitGuid = businessUnitId.replace(/[{}]/g, "");

        // 同じ部署のユーザーを取得
        const users = await xrm.WebApi.retrieveMultipleRecords(
          "systemuser",
          `?$filter=_businessunitid_value eq ${businessUnitGuid}&$select=systemuserid,fullname&$orderby=fullname`
        );

        // オプションに変換（systemuseridも波括弧を除去）
        const options: Option[] = users.entities.map((user: any) => ({
          value: user.systemuserid?.replace(/[{}]/g, "") || "",
          label: user.fullname || "",
        }));

        setHeaderSelectOptions(options);

        // デフォルトでログインユーザーをセット（オプションに存在することを確認）
        const userExists = options.some(opt => opt.value === userId.toLowerCase());
        if (userExists) {
          setHeaderSelectValue(userId.toLowerCase());
        } else if (options.length > 0) {
          // ログインユーザーがオプションにない場合は最初のユーザーをセット
          setHeaderSelectValue(options[0].value);
        }
      } catch (err) {
        console.error("ユーザー取得エラー:", err);
      } finally {
        setIsHeaderSelectLoading(false);
      }
    };

    loadUsers();
  }, []);

  /** Lookupデータを取得（EndUser: account、proto_nonyudevice、proto_subcategory） */
  useEffect(() => {
    const loadLookupData = async () => {
      const xrm = getXrm();
      if (!xrm?.WebApi) {
        return;
      }

      try {
        // EndUser（account）を取得
        const endUserResult = await xrm.WebApi.retrieveMultipleRecords(
          "account",
          "?$select=accountid,name&$orderby=name"
        );
        const endUserOpts: Option[] = endUserResult.entities.map((item: any) => ({
          value: item.accountid?.replace(/[{}]/g, "") || "",
          label: item.name || "",
        }));
        setEndUserOptions(endUserOpts);

        // 装置S/N（proto_nonyudevice）を取得
        const deviceSnResult = await xrm.WebApi.retrieveMultipleRecords(
          "proto_nonyudevice",
          "?$select=proto_nonyudeviceid,proto_name&$orderby=proto_name"
        );
        const deviceSnOpts: Option[] = deviceSnResult.entities.map((item: any) => ({
          value: item.proto_nonyudeviceid?.replace(/[{}]/g, "") || "",
          label: item.proto_name || "",
        }));
        setDeviceSnOptions(deviceSnOpts);

        // proto_subcategoryを取得
        const subcategoryResult = await xrm.WebApi.retrieveMultipleRecords(
          "proto_subcategory",
          "?$select=proto_subcategoryid,proto_name&$orderby=proto_name"
        );
        const subcategoryOpts: Option[] = subcategoryResult.entities.map((item: any) => ({
          value: item.proto_subcategoryid?.replace(/[{}]/g, "") || "",
          label: item.proto_name || "",
        }));
        setSubcategoryOptions(subcategoryOpts);

        // proto_workordertypeを取得
        const woTypeResult = await xrm.WebApi.retrieveMultipleRecords(
          "proto_workordertype",
          "?$select=proto_workordertypeid,proto_name&$orderby=proto_name"
        );
        const woTypeOpts: Option[] = woTypeResult.entities.map((item: any) => ({
          value: item.proto_workordertypeid?.replace(/[{}]/g, "") || "",
          label: item.proto_name || "",
        }));
        setWoTypeOptions(woTypeOpts);
      } catch (err) {
        console.error("Lookupデータ取得エラー:", err);
      }
    };

    loadLookupData();
  }, []);

  /** イベントをマージ（APIから取得したイベント + 休憩時間イベント） */
  const mergedEvents = useMemo(() => {
    return [...events];
  }, [events]);

  /** 今日の日付フォーマット（例：2025/10/14） */
  const formattedToday = formatToday();
  const dayCopyEntryCount = useMemo(() => {
    if (!dayCopySourceDate) return 0;
    return mergedEvents.filter((event) => {
      const eventStart = (event as any).start;
      if (!eventStart) return false;
      const eventDate = eventStart instanceof Date ? eventStart : new Date(eventStart);
      return eventDate.toDateString() === dayCopySourceDate.toDateString();
    }).length;
  }, [mergedEvents, dayCopySourceDate]);

  const handleDayCopyExecute = async (targetDate: string) => {
    if (!dayCopySourceDate) return;
    const sourceDateKey = dayCopySourceDate.toDateString();
    const sourceEvents = mergedEvents.filter((event) => {
      const eventStart = (event as any).start;
      if (!eventStart) return false;
      const eventDate = eventStart instanceof Date ? eventStart : new Date(eventStart);
      return eventDate.toDateString() === sourceDateKey;
    });

    for (const event of sourceEvents) {
      const startValue = (event as any).start;
      const endValue = (event as any).end;
      if (!startValue || !endValue) continue;

      const sourceStart = startValue instanceof Date ? startValue : new Date(startValue);
      const sourceEnd = endValue instanceof Date ? endValue : new Date(endValue);
      const durationMs = sourceEnd.getTime() - sourceStart.getTime();

      const targetStart = new Date(`${targetDate}T00:00:00`);
      targetStart.setHours(
        sourceStart.getHours(),
        sourceStart.getMinutes(),
        sourceStart.getSeconds(),
        sourceStart.getMilliseconds()
      );
      const targetEnd = new Date(targetStart.getTime() + durationMs);

      await handleTimeEntrySubmit({
        id: "",
        wo: (event as any).workOrderId || "",
        start: targetStart,
        end: targetEnd,
        endUser: (event as any).endUser || "",
        timezone: (event as any).timezone || "",
        resource: "",
        wisdomBu: "",
        sapBu: "",
        timeCategory: (event as any).timecategory ?? "",
        mainCategory: (event as any).maincategory ?? "",
        paymentType: (event as any).paymenttype ?? "",
        deviceSn: (event as any).deviceSn || "",
        woType: (event as any).woType || "",
        subcategory: (event as any).subcategory || "",
        task: (event as any).title || "",
        workStatus: "",
        comment: "",
      });
    }

    setIsDayCopyModalOpen(false);
  };

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
          isCopyEnabled={!!selectedCalendarDate}
          onCopyClick={() => {
            setDayCopySourceDate(selectedCalendarDate);
            setIsDayCopyModalOpen(true);
          }}
          selectOptions={headerSelectOptions}
          selectValue={headerSelectValue}
          onSelectChange={setHeaderSelectValue}
          isSelectLoading={isHeaderSelectLoading}
        />

        {/* 中央：サイドバー＋カレンダー */}
        <div className="content-middle">
          {isBreakTimeLoading && (
            <div className="content-loading-overlay">
              <Spinner size="large" />
            </div>
          )}
          {/* Sidebar が Context からお気に入りタスクを取得 */}
          <Sidebar
            mainTab={mainTab}
            selectedTask={selectedSidebarTask}
            onTaskSelect={setSelectedSidebarTask}
            onResourceSelectionChange={(resources) =>
              setSelectedSidebarResourcesText(resources.map((r) => r.label).join("\n"))
            }
          />

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
              onHeaderDateSelect={setSelectedCalendarDate}
              onEventClick={handleEventClick}
              onEventDuplicate={handleEventDuplicate}
              onEventDelete={handleDeleteTimeEntry}
              events={mergedEvents}
              isSubgrid={isSubgrid}
            />
          </div>
        </div>

      <Footer
        onOpenUserList={() => setIsUserListModalOpen(true)}
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
        endUserOptions={endUserOptions}
        deviceSnOptions={deviceSnOptions}
        subcategoryOptions={subcategoryOptions}
        woTypeOptions={woTypeOptions}
        isSubgrid={isSubgrid}
        selectedWO={selectedWO}
        selectedIndirectTask={selectedIndirectTask}
        selectedResourcesText={selectedSidebarResourcesText}
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
      <DayCopyModal
        isOpen={isDayCopyModalOpen}
        onClose={() => setIsDayCopyModalOpen(false)}
        sourceDate={dayCopySourceDate}
        sourceEntryCount={dayCopyEntryCount}
        onExecute={handleDayCopyExecute}
      />
    </div>
  );
}
