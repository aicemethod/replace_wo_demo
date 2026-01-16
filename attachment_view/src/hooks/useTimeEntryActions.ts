import { useEvents } from "./useEvents";
import { getXrm } from "../utils/xrmUtils";
import { timeEntryClient } from "../api/dataverseClient/timeEntryClient";
import { createEventFromDuplicateData } from "../utils/modalHelpers";
import { createDefaultTimeRange } from "../utils/dateFormatter";
import type { Event, TimeEntryData } from "../types";

/**
 * タイムエントリ関連のアクション管理フック
 * 作成、更新、削除、複製などの操作を管理
 */
export const useTimeEntryActions = (
    selectedWO: string,
    setIsTimeEntryModalOpen: (open: boolean) => void,
    setSelectedEvent: (event: Event | null) => void,
    setSelectedDateTime: (range: { start: Date; end: Date } | null) => void,
    isSubgrid: boolean = false
) => {
    const { createOrUpdateEvent, refetchEvents, fetchEventDetail } = useEvents(selectedWO, isSubgrid);

    /** タイムエントリ登録・更新処理 */
    const handleTimeEntrySubmit = async (data: TimeEntryData) => {
        await createOrUpdateEvent(data);
        await refetchEvents();
        setIsTimeEntryModalOpen(false);
        setSelectedEvent(null);
        setSelectedDateTime(null);
    };

    /** イベントクリック時の詳細取得処理（既存データから取得） */
    const handleEventClick = async (event: Event) => {
        try {
            const detail = await fetchEventDetail(event.id);
            if (!detail) {
                console.warn("イベントが見つかりません:", event.id);
                return;
            }

            setSelectedEvent(detail);
            setSelectedDateTime({
                start: new Date(detail.start),
                end: new Date(detail.end),
            });
            setIsTimeEntryModalOpen(true);
        } catch (error) {
            console.error("イベント詳細取得エラー:", error);
            alert("イベントの詳細取得に失敗しました。");
        }
    };

    /** イベント削除処理 */
    const handleDeleteTimeEntry = async (id: string) => {
        const xrm = getXrm();

        try {
            if (!xrm) {
                // ローカルモード（mockEvents）
                const mockEvents = JSON.parse(localStorage.getItem("mockEvents") || "[]");
                const updated = mockEvents.filter((ev: any) => ev.id !== id);
                localStorage.setItem("mockEvents", JSON.stringify(updated));
                await refetchEvents();
                console.log(`ローカルイベント削除完了: ${id}`);
                return;
            }

            // Dataverse 環境：API経由で削除
            await timeEntryClient.deleteTimeEntry(id);
            await refetchEvents();
            console.log(`Dataverse イベント削除完了: ${id}`);
        } catch (error) {
            console.error("イベント削除中にエラーが発生しました:", error);
            alert("削除に失敗しました。");
        } finally {
            // 状態リセット
            setIsTimeEntryModalOpen(false);
            setSelectedEvent(null);
            setSelectedDateTime(null);
        }
    };

    /** 複製処理 */
    const handleDuplicate = (duplicateData: TimeEntryData) => {
        // 現在のモーダルを閉じる
        setIsTimeEntryModalOpen(false);

        // 少し遅延させてから複製モーダルを開く
        setTimeout(() => {
            // ヘルパー関数を使用してイベントオブジェクトを生成
            const event = createEventFromDuplicateData(duplicateData);
            setSelectedEvent(event);

            // selectedDateTimeをnullに設定して複製モードで開く
            setSelectedDateTime(null);

            // 複製モードでモーダルを開く
            setIsTimeEntryModalOpen(true);
        }, 100);
    };

    /** 新規タイムエントリ作成時の共通処理 */
    const openNewTimeEntry = () => {
        const timeRange = createDefaultTimeRange();
        setSelectedDateTime(timeRange);
        setSelectedEvent(null);
        setIsTimeEntryModalOpen(true);
    };

    return {
        handleTimeEntrySubmit,
        handleEventClick,
        handleDeleteTimeEntry,
        handleDuplicate,
        openNewTimeEntry,
        refetchEvents,
    };
};
