/**
 * 共通型定義ファイル
 * アプリケーション全体で使用される型を集約
 */

/** メインタブ種別 */
export type MainTab = "user" | "direct" | "indirect";

/** 表示モード種別 */
export type ViewMode = "稼働日" | "週";

/** WorkOrder型 */
export type WorkOrder = {
    id: string;
    name: string;
};

/** 日時範囲型 */
export type DateTimeRange = {
    start: Date;
    end: Date;
};

/** イベント型 */
export type Event = {
    id: string;
    title?: string;
    start: Date;
    end: Date;
    workOrder?: string;
    endUser?: string | null;
    endUserName?: string | null;
    deviceSn?: string | null;
    deviceSnName?: string | null;
    woType?: string | null;
    woTypeName?: string | null;
    subcategory?: string | number | null;
    subcategoryName?: string | null;
    timezone?: string;
    resource?: string;
    timecategory?: string;
    maincategory?: string;
    paymenttype?: string;
    task?: string;
    comment?: string;
    isDuplicate?: boolean;
};

/** オプション型（共通） */
export type Option = {
    value: string;
    label: string;
};

/** オプションセット型 */
export type OptionSet = {
    maincategory: Option[];
    timecategory: Option[];
    paymenttype: Option[];
    timezone: Option[];
};

/** リソース型 */
export type Resource = {
    id: string;
    name: string;
    number?: string;
};

/** ユーザー型 */
export type User = {
    id: string;
    firstName?: string;
    lastName?: string;
    employeeid?: string;
};

/** お気に入りタスク型 */
export type FavoriteTask = {
    id: string;
    taskName: string;
    subcategoryName: string;
};

/** 並び替えオプション型 */
export type UserSortKey = "numberAsc" | "numberDesc" | "nameAsc" | "nameDesc";
export type TaskSortKey = "categoryAsc" | "categoryDesc" | "taskAsc" | "taskDesc";

/** 検索タイプ */
export type SearchType = "name" | "number";

/** モーダルサイズ */
export type ModalSize = "small" | "medium" | "large";

/** タイムエントリデータ型 */
export type TimeEntryData = {
    start?: Date;
    end?: Date;
    startDate?: string;
    startHour?: string;
    startMinute?: string;
    endDate?: string;
    endHour?: string;
    endMinute?: string;
    wo: string;
    endUser?: string;
    timezone?: string;
    resource?: string;
    timeCategory?: string;
    mainCategory?: string;
    paymentType?: string;
    deviceSn?: string;
    subcategory?: string;
    woType?: string;
    task?: string;
    workStatus?: string;
    wisdomBu?: string;
    sapBu?: string;
    woTypeName?: string | null;
    comment?: string;
    id?: string;
};

/** ボタンカラー種別 */
export type ButtonColor = "primary" | "secondary";

/** ボタンタイプ */
export type ButtonType = "button" | "submit" | "reset";

/** 入力タイプ */
export type InputType = "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "time" | "datetime-local";
