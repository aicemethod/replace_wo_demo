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
    billabletype?: number;
    paymenttobe?: number;
    paymentto?: number;
    concessiontype?: number;
    woSo?: string | null;
    woSoName?: string | null;
    timezone?: string;
    extendedProps?: Record<string, any>;
};

/** GUID比較用にID形式を正規化 */
const normalizeEntityId = (id?: string | null): string =>
    String(id || "").replace(/[{}]/g, "").toLowerCase();

/** proto_timeentry 1件を EventData に整形（WO 経路・直接取得で共通） */
const mapTimeEntryRow = (t: any, workOrderId: string): EventData => ({
    id: t.proto_timeentryid,
    title: t.proto_name || "作業",
    start: t.proto_startdatetime,
    end: t.proto_enddatetime,
    workOrderId: normalizeEntityId(workOrderId),
    maincategory: t.proto_maincategory,
    timecategory: t.proto_timecategory,
    subcategory: t._proto_subcategory_value?.replace(/[{}]/g, "") || t.proto_subcategory?.proto_subcategoryid?.replace(/[{}]/g, "") || null,
    subcategoryName: t.proto_subcategory?.proto_name || null,
    endUser: t._proto_wo_fab_value?.replace(/[{}]/g, "") || null,
    endUserName: t['_proto_wo_fab_value@OData.Community.Display.V1.FormattedValue'] || null,
    deviceSn: t._proto_devicesearch_value?.replace(/[{}]/g, "") || t.proto_devicesearch?.proto_devicesearchid?.replace(/[{}]/g, "") || null,
    deviceSnName: t.proto_devicesearch?.proto_name || null,
    woType: t._proto_wo_category_value?.replace(/[{}]/g, "") || t.proto_wo_category?.proto_workordertypeid?.replace(/[{}]/g, "") || null,
    woTypeName: t.proto_wo_category?.proto_name || t['_proto_wo_category_value@OData.Community.Display.V1.FormattedValue'] || null,
    paymenttype: t.proto_paymenttype,
    billabletype: t.proto_billabletype,
    paymenttobe: t.proto_payment_tobe,
    paymentto: t.proto_paymentto_tobe,
    concessiontype: t.proto_concession_tobe,
    woSo: t._proto_wo_so_value?.replace(/[{}]/g, "") || null,
    woSoName: t['_proto_wo_so_value@OData.Community.Display.V1.FormattedValue'] || null,
    timezone: t.proto_timezone ?? null,
    extendedProps: {
        timezone: t.proto_timezone ?? null,
        deviceSn: t._proto_devicesearch_value?.replace(/[{}]/g, "") || t.proto_devicesearch?.proto_devicesearchid?.replace(/[{}]/g, "") || null,
        deviceSnName: t.proto_devicesearch?.proto_name || null,
    },
});

const mergeEventsById = (a: EventData[], b: EventData[]): EventData[] => {
    const seen = new Set<string>();
    const out: EventData[] = [];
    for (const e of [...a, ...b]) {
        if (seen.has(e.id)) continue;
        seen.add(e.id);
        out.push(e);
    }
    return out;
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
                const targetId = normalizeEntityId(workOrderId);
                return localMock.filter((e: EventData) => normalizeEntityId(e.workOrderId) === targetId);
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
            const targetId = normalizeEntityId(workOrderId);
            return mockEvents.filter((e) => normalizeEntityId(e.workOrderId) === targetId);
        }
        return mockEvents;
    }

    // Dataverse 環境
    const entityName = "proto_workorder";
    const navigationName = "proto_timeentry_wonumber_proto_workorder";
    const userId = xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");

    // 通常画面向け: proto_resource -> proto_bookableresource -> proto_systemuser で対象WOを特定
    const resourceQuery =
        `?$select=_proto_workorder_value,_proto_resource1_value` +
        `&$filter=_proto_resource1_value ne null and _proto_workorder_value ne null`;
    const resourceResult = await xrm.WebApi.retrieveMultipleRecords("proto_resource", resourceQuery);

    type ResourceRow = { workOrderId: string; bookableResourceId: string };
    const resourceRows: ResourceRow[] = resourceResult.entities
        .map((record: any): ResourceRow => ({
            workOrderId: String(record._proto_workorder_value || "").replace(/[{}]/g, ""),
            bookableResourceId: String(record._proto_resource1_value || "").replace(/[{}]/g, ""),
        }))
        .filter((row: ResourceRow) => row.workOrderId.length > 0 && row.bookableResourceId.length > 0);

    let fromResource: EventData[] = [];

    if (resourceRows.length > 0) {
        const bookableResourceIds = Array.from(new Set(resourceRows.map((row: ResourceRow) => row.bookableResourceId)));
        const bookableResourceFilter = bookableResourceIds
            .map((id) => `proto_bookableresourceid eq ${id}`)
            .join(" or ");
        const matchedBookableResourceQuery =
            `?$select=proto_bookableresourceid,_proto_systemuser_value` +
            `&$filter=(${bookableResourceFilter}) and _proto_systemuser_value eq ${userId}`;
        const matchedBookableResourceResult = await xrm.WebApi.retrieveMultipleRecords(
            "proto_bookableresource",
            matchedBookableResourceQuery
        );
        const matchedBookableResourceIds = new Set(
            matchedBookableResourceResult.entities
                .map((record: any) => String(record.proto_bookableresourceid || "").replace(/[{}]/g, ""))
                .filter((id: string) => id.length > 0)
        );

        if (matchedBookableResourceIds.size > 0) {
            let targetWorkOrderIds = Array.from(
                new Set(
                    resourceRows
                        .filter((row: ResourceRow) => matchedBookableResourceIds.has(row.bookableResourceId))
                        .map((row: ResourceRow) => row.workOrderId)
                )
            );

            if (workOrderId) {
                const targetId = normalizeEntityId(workOrderId);
                targetWorkOrderIds = targetWorkOrderIds.filter((id) => normalizeEntityId(id) === targetId);
            }

            if (targetWorkOrderIds.length > 0) {
                const woFilter = targetWorkOrderIds
                    .map((id) => `proto_workorderid eq ${id}`)
                    .join(" or ");

                const query =
                    `?$select=proto_workorderid,proto_wonumber` +
                    `&$filter=(${woFilter})` +
                    `&$expand=${navigationName}(` +
                    `$select=` +
                    `proto_timeentryid,proto_name,proto_startdatetime,proto_enddatetime,` +
                    `proto_maincategory,proto_paymenttype,proto_billabletype,proto_payment_tobe,proto_paymentto_tobe,proto_concession_tobe,proto_timecategory,proto_timezone,` +
                    `_proto_wo_fab_value,_proto_wo_category_value,_proto_wo_so_value;` +
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

                fromResource = result.entities.flatMap((wo: any) =>
                    (wo[navigationName] || []).map((t: any) =>
                        mapTimeEntryRow(t, String(wo.proto_workorderid || ""))
                    )
                );
            }
        }
    }

    /** ログインユーザーが作成した proto_timeentry（リソース経路に無い WO も含め表示） */
    const timeEntryExpand =
        `$expand=` +
        `proto_subcategory(` +
        `$select=proto_subcategoryid,proto_name` +
        `),` +
        `proto_devicesearch(` +
        `$select=proto_name` +
        `),` +
        `proto_wo_category(` +
        `$select=proto_workordertypeid,proto_name` +
        `)`;

    let createdByFilter = `_createdby_value eq ${userId}`;
    if (workOrderId) {
        const wid = normalizeEntityId(workOrderId);
        createdByFilter += ` and _proto_wonumber_value eq ${wid}`;
    }

    const myQuery =
        `?$filter=${createdByFilter}` +
        `&$select=` +
        `proto_timeentryid,proto_name,proto_startdatetime,proto_enddatetime,` +
        `proto_maincategory,proto_paymenttype,proto_billabletype,proto_payment_tobe,proto_paymentto_tobe,proto_concession_tobe,proto_timecategory,proto_timezone,` +
        `_proto_wo_fab_value,_proto_wo_category_value,_proto_wo_so_value,_proto_wonumber_value` +
        `&${timeEntryExpand}`;

    const myResult = await xrm.WebApi.retrieveMultipleRecords("proto_timeentry", myQuery);
    const fromCreatedByMe = myResult.entities.map((t: any) =>
        mapTimeEntryRow(t, t._proto_wonumber_value || "")
    );

    return mergeEventsById(fromResource, fromCreatedByMe);
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
        billabletype: event.billabletype?.toString(),
        paymenttobe: event.paymenttobe?.toString(),
        paymentto: event.paymentto?.toString(),
        concessiontype: event.concessiontype?.toString(),
        woSo: event.woSo || null,
        woSoName: event.woSoName || null,
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
    const normalizedSelectedWO = normalizeEntityId(selectedWO);
    const workOrderIdForQuery = isSubgrid && selectedWO !== "all" ? normalizedSelectedWO : undefined;

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
            deviceSn: e.deviceSn ?? e.extendedProps?.deviceSn ?? null,
            isTargetWO: selectedWO === "all" || normalizeEntityId(e.workOrderId) === normalizedSelectedWO,
        },
    }));

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
                billableType: data.billableType ?? null,
                paymentToBe: data.paymentToBe ?? null,
                paymentTo: data.paymentTo ?? null,
                concessionType: data.concessionType ?? null,
                woSo: data.woSo ?? null,
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
