import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getXrm } from "../utils/xrmUtils";
import { dataverseClient } from "../api/dataverseClient";

/** イベントデータ型 */
export type EventData = {
    id: string;
    title: string;
    start: string;
    end: string;
    workOrderId: string;
    maincategory?: number;
    timecategory?: number;
    subcategory?: number;
    paymenttype?: number;
    timezone?: string;
    extendedProps?: Record<string, any>;
};

/**
 * Dataverse またはローカルモックからイベント一覧を取得
 * @param workOrderId 特定のWorkOrderのID（サブグリッドの場合に指定）
 */
const fetchEvents = async (workOrderId?: string): Promise<EventData[]> => {
    const xrm = getXrm();

    // ローカル環境（モックデータ）
    if (!xrm) {
        const localMock = JSON.parse(localStorage.getItem("mockEvents") || "[]");
        if (localMock.length > 0) {
            // workOrderIdが指定されている場合、フィルタリング
            if (workOrderId) {
                return localMock.filter((e: EventData) => e.workOrderId === workOrderId);
            }
            return localMock;
        }

        const mockEvents = [
            {
                id: "1",
                title: "モック会議",
                start: "2025-10-14T09:00:00",
                end: "2025-10-14T10:00:00",
                workOrderId: "wo-001",
            },
            {
                id: "2",
                title: "別WOの打合せ",
                start: "2025-10-14T13:00:00",
                end: "2025-10-14T14:00:00",
                workOrderId: "wo-002",
            },
        ];

        // workOrderIdが指定されている場合、フィルタリング
        if (workOrderId) {
            return mockEvents.filter((e) => e.workOrderId === workOrderId);
        }
        return mockEvents;
    }

    // Dataverse 環境
    const entityName = "proto_workorder";
    const navigationName = "proto_timeentry_wonumber_proto_workorder";
    const userId = xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");

    // workOrderIdが指定されている場合（サブグリッド）、特定のWorkOrderのみを取得
    let filter = `_createdby_value eq ${userId}`;
    if (workOrderId) {
        filter = `proto_workorderid eq ${workOrderId}`;
    }

    const query =
        `?$select=proto_workorderid,proto_wonumber` +
        `&$filter=${filter}` +
        `&$expand=${navigationName}(` +
        `$select=proto_timeentryid,proto_name,proto_startdatetime,proto_enddatetime,` +
        `proto_maincategory,proto_paymenttype,proto_timecategory,proto_subcategory,proto_timezone)`;

    const result = await xrm.WebApi.retrieveMultipleRecords(entityName, query);

    // データ整形
    // FullCalendarはUTCのISO文字列を自動的にローカル時間（JST）に変換して表示するため、
    // Dataverseから取得したUTC時間をそのまま使用する
    return result.entities.flatMap((wo: any) =>
        (wo[navigationName] || []).map((t: any) => ({
            id: t.proto_timeentryid,
            title: t.proto_name || "作業",
            start: t.proto_startdatetime,
            end: t.proto_enddatetime,
            workOrderId: wo.proto_workorderid,
            maincategory: t.proto_maincategory,
            timecategory: t.proto_timecategory,
            subcategory: t.proto_subcategory,
            paymenttype: t.proto_paymenttype,
            timezone: t.proto_timezone ?? null,
            extendedProps: {
                timezone: t.proto_timezone ?? null,
            },
        }))
    );
};

/**
 * イベント詳細を取得（既存データから取得、API呼び出しなし）
 */
const fetchEventDetail = async (id: string, allEvents: EventData[]) => {
    // 既存のイベントデータから検索
    const event = allEvents.find(e => e.id === id);
    if (!event) {
        console.warn("イベントが見つかりません:", id);
        return null;
    }

    return {
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        maincategory: event.maincategory?.toString(),
        timecategory: event.timecategory?.toString(),
        subcategory: event.subcategory?.toString(),
        paymenttype: event.paymenttype?.toString(),
        timezone: event.timezone,
        workOrder: event.workOrderId,
    };
};

/**
 * イベント一覧・登録・更新・詳細取得を統合管理するフック
 */
export const useEvents = (selectedWO: string, isSubgrid: boolean = false) => {
    const queryClient = useQueryClient();
    const xrm = getXrm();

    /** サブグリッドの場合、特定のWorkOrderのイベントのみを取得 */
    const workOrderIdForQuery = isSubgrid && selectedWO !== "all" ? selectedWO : undefined;

    /** イベント一覧取得 */
    const {
        data: allEvents = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["events", workOrderIdForQuery, isSubgrid],
        queryFn: () => fetchEvents(workOrderIdForQuery),
    });

    /** 選択中の WorkOrder に対応するイベントを強調 */
    const events = allEvents.map((e) => ({
        ...e,
        extendedProps: {
            ...e.extendedProps,
            isTargetWO: selectedWO === "all" || e.workOrderId === selectedWO,
        },
    }));

    /** 登録・更新処理 */
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // 複製の場合は常に新規作成として扱う
            const isUpdate = !!data.id && data.id !== "" && !data.isDuplicate;

            // Dataverse 環境
            if (xrm) {
                return isUpdate
                    ? dataverseClient.updateTimeEntry(data.id, data)
                    : dataverseClient.createTimeEntry(data);
            }

            // ローカルモード
            const current = JSON.parse(localStorage.getItem("mockEvents") || "[]");
            if (isUpdate) {
                const updated = current.map((e: any) =>
                    e.id === data.id ? { ...e, ...data } : e
                );
                localStorage.setItem("mockEvents", JSON.stringify(updated));
            } else {
                const newItem = { ...data, id: String(Date.now()) };
                localStorage.setItem("mockEvents", JSON.stringify([...current, newItem]));
            }
            return true;
        },
        onSuccess: async () => {
            // すべてのイベントクエリを無効化（サブグリッド/通常表示両方）
            await queryClient.invalidateQueries({ queryKey: ["events"] });
            await refetch();
        },
        onError: (err) => {
            console.error("TimeEntry登録/更新失敗:", err);
            alert("保存に失敗しました。詳細はコンソールを確認してください。");
        },
    });

    /** モーダル送信処理 */
    const handleSubmit = async (data: any) => {
        await mutation.mutateAsync(data);
        await refetch();
    };

    return {
        events,
        isLoading,
        isError,
        refetchEvents: refetch,
        createOrUpdateEvent: handleSubmit,
        fetchEventDetail: (id: string) => fetchEventDetail(id, allEvents),
    };
};