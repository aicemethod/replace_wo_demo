import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getXrm } from "../utils/xrmUtils";
import { dataverseClient } from "../api/dataverseClient";
import type { TimeEntryInput } from "../api/dataverseClient/timeEntryClient";

/** イベントデータ型 */
export type EventData = {
    id: string;
    title: string;
    start: string;
    end: string;
    workOrderId: string;
    maincategory?: number;
    timecategory?: number;
    subcategory?: string | number | null;
    subcategoryName?: string | null;
    endUser?: string | null;
    endUserName?: string | null;
    deviceSn?: string | null;
    deviceSnName?: string | null;
    woType?: string | null;
    woTypeName?: string | null;
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
        `$select=` +
        `proto_timeentryid,proto_name,proto_startdatetime,proto_enddatetime,` +
        `proto_maincategory,proto_paymenttype,proto_timecategory,proto_timezone,` +
        `_proto_enduser_value,_proto_wo_category_value;` +
        `$expand=` +
        `proto_subcategory(` +
        `$select=proto_subcategoryid,proto_name` +
        `),` +
        `proto_devicesearch(` +
        `$select=proto_name` +
        `),` +
        `proto_wo_category(` +
        `$select=proto_workordertypeid,proto_name` +
        `)` +
        `)`;


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
            subcategory: t._proto_subcategory_value?.replace(/[{}]/g, "") || t.proto_subcategory?.proto_subcategoryid?.replace(/[{}]/g, "") || null,
            subcategoryName: t.proto_subcategory?.proto_name || null,
            endUser: t._proto_enduser_value?.replace(/[{}]/g, "") || null,
            endUserName: t['_proto_enduser_value@OData.Community.Display.V1.FormattedValue'] || null,
            deviceSn: t._proto_devicesearch_value?.replace(/[{}]/g, "") || t.proto_devicesearch?.proto_devicesearchid?.replace(/[{}]/g, "") || null,
            deviceSnName: t.proto_devicesearch?.proto_name || null,
            woType: t._proto_wo_category_value?.replace(/[{}]/g, "") || t.proto_wo_category?.proto_workordertypeid?.replace(/[{}]/g, "") || null,
            woTypeName: t.proto_wo_category?.proto_name || t['_proto_wo_category_value@OData.Community.Display.V1.FormattedValue'] || null,
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
        subcategory: event.subcategory || null,
        subcategoryName: event.subcategoryName || null,
        endUser: event.endUser || null,
        endUserName: event.endUserName || null,
        deviceSn: event.deviceSn || null,
        deviceSnName: event.deviceSnName || null,
        woType: event.woType || null,
        woTypeName: event.woTypeName || null,
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
    const events = allEvents.map((e) => {
        // 休憩時間のイベントは薄いグレーで表示
        const isBreakTime =
            e.title === "休憩" ||
            e.title === "休憩1" ||
            e.title === "休憩2" ||
            e.extendedProps?.comment === "休憩" ||
            e.extendedProps?.comment === "休憩1" ||
            e.extendedProps?.comment === "休憩2" ||
            e.extendedProps?.isBreakTime === true;

        // 隙間時間のイベントも薄いグレーで表示
        const isGapTime =
            e.title === "隙間時間" ||
            e.title === "隙間時間1" ||
            e.title === "隙間時間2" ||
            e.title?.includes("隙間") ||
            e.extendedProps?.comment === "隙間時間" ||
            e.extendedProps?.comment === "隙間時間1" ||
            e.extendedProps?.comment === "隙間時間2" ||
            e.extendedProps?.comment?.includes("隙間") ||
            e.extendedProps?.isGapTime === true;

        // 休憩時間または隙間時間の場合はグレーで表示
        const isSpecialTime = isBreakTime || isGapTime;

        // 既存のbackgroundColorを保持（APIから取得したイベントに既に色が設定されている場合）
        // EventData型にはbackgroundColor等が定義されていないため、anyとして扱う
        const eventWithColors = e as any;
        const backgroundColor = isSpecialTime
            ? "#e0e0e0"
            : (eventWithColors.backgroundColor || undefined);
        const borderColor = isSpecialTime
            ? "#d0d0d0"
            : (eventWithColors.borderColor || undefined);
        const textColor = isSpecialTime
            ? "#666"
            : (eventWithColors.textColor || undefined);

        return {
            ...e,
            backgroundColor,
            borderColor,
            textColor,
            extendedProps: {
                ...e.extendedProps,
                isTargetWO: selectedWO === "all" || e.workOrderId === selectedWO,
            },
        };
    });

    /** 登録・更新処理 */
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            // 複製の場合は常に新規作成として扱う
            const isUpdate = !!data.id && data.id !== "" && !data.isDuplicate;

            // TimeEntryClient 用入力データに正規化
            const input: TimeEntryInput = {
                title: data.task || data.comment || undefined,
                wo: data.wo,
                start: data.start,
                end: data.end,
                // オプションセット
                mainCategory: data.mainCategory ?? null,
                timeCategory: data.timeCategory ?? null,
                paymentType: data.paymentType ?? null,
                timezone: data.timezone ?? null,
                // Lookup（ID）
                subcategory: data.subcategory || null,
                endUser: data.endUser || null,
                deviceSn: data.deviceSn || null,
                woType: data.woType || null,
            };

            // Dataverse 環境
            if (xrm) {
                return isUpdate
                    ? dataverseClient.updateTimeEntry(data.id, input)
                    : dataverseClient.createTimeEntry(input);
            }

            // ローカルモード（モック保存用に、元データ + 正規化データを保持）
            const current = JSON.parse(localStorage.getItem("mockEvents") || "[]");
            if (isUpdate) {
                const updated = current.map((e: any) =>
                    e.id === data.id ? { ...e, ...data, ...input } : e
                );
                localStorage.setItem("mockEvents", JSON.stringify(updated));
            } else {
                const newItem = { ...data, ...input, id: String(Date.now()) };
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
