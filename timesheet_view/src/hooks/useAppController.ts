import { useWorkOrders } from "./useWorkOrders";
import { useOptionSets } from "./useOptionSets";
import { useEvents } from "./useEvents";
import { useCalendarController } from "./useCalendarController";
import { useAppState } from "./useAppState";
import { useTimeEntryActions } from "./useTimeEntryActions";
import { useModalActions } from "./useModalActions";

/**
 * DataverseApp 全体の状態とロジックを統括するカスタムフック
 * - WorkOrder / OptionSet / Event の取得と管理
 * - カレンダー操作（日付遷移など）
 * - モーダルや選択状態の制御
 */
export const useAppController = () => {
    /** データ取得フック */
    const { workOrders, isLoading: woLoading } = useWorkOrders();
    const { optionSets, isLoading: osLoading } = useOptionSets();

    /** アプリケーション状態管理 */
    const appState = useAppState();
    const {
        selectedWO,
        setSelectedWO,
        viewMode,
        setViewMode,
        currentDate,
        setCurrentDate,
        isTimeEntryModalOpen,
        setIsTimeEntryModalOpen,
        selectedDateTime,
        setSelectedDateTime,
        selectedEvent,
        setSelectedEvent,
        mainTab,
        setMainTab,
        isFavoriteTaskModalOpen,
        setIsFavoriteTaskModalOpen,
        isUserListModalOpen,
        setIsUserListModalOpen,
        isSubgrid,
    } = appState;

    /** イベント関連フック */
    const { events, isLoading: evLoading } = useEvents(selectedWO, isSubgrid);

    /** カレンダー操作ハンドラ（前・次・今日） */
    const { handlePrev, handleNext, handleToday } = useCalendarController(viewMode, setCurrentDate);

    /** タイムエントリ関連アクション */
    const timeEntryActions = useTimeEntryActions(
        selectedWO,
        setIsTimeEntryModalOpen,
        setSelectedEvent,
        setSelectedDateTime,
        isSubgrid
    );

    /** モーダル関連アクション */
    const modalActions = useModalActions(setIsFavoriteTaskModalOpen, setIsUserListModalOpen);

    /** 全体のローディング状態 */
    const isLoading = woLoading || osLoading || evLoading;

    /** 外部へ公開する値・関数群 */
    return {
        // データ
        workOrders,
        optionSets,
        events,

        // ステート
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
        isSubgrid,

        // 操作ハンドラ
        ...timeEntryActions,
        ...modalActions,
        handlePrev,
        handleNext,
        handleToday,

        // ローディング状態
        isLoading,
    };
};
