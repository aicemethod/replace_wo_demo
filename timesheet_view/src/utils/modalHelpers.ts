/**
 * モーダル関連のヘルパー関数
 * モーダルの開閉やデータ変換処理を集約
 */

import type { Event } from "../types";

/**
 * 複製データからイベントオブジェクトを生成
 * @param duplicateData 複製元のデータ
 * @returns イベントオブジェクト
 */
export const createEventFromDuplicateData = (duplicateData: any): Event => {
    const start = new Date(`${duplicateData.startDate}T${duplicateData.startHour}:${duplicateData.startMinute}`);
    const end = new Date(`${duplicateData.endDate}T${duplicateData.endHour}:${duplicateData.endMinute}`);

    return {
        // 複製の場合は空文字列でidを設定（新規作成として扱う）
        id: "",
        start,
        end,
        workOrder: duplicateData.wo,
        endUser: duplicateData.endUser,
        timezone: duplicateData.timezone,
        resource: duplicateData.resource,
        timecategory: duplicateData.timeCategory,
        maincategory: duplicateData.mainCategory,
        paymenttype: duplicateData.paymentType,
        task: duplicateData.task,
        comment: duplicateData.comment,
        isDuplicate: true,
    };
};

/**
 * WorkOrder配列をオプション配列に変換
 * @param workOrders WorkOrder配列
 * @returns オプション配列
 */
export const convertWorkOrdersToOptions = (workOrders: any[]) => {
    return workOrders.map((w) => ({ value: w.id, label: w.name }));
};
