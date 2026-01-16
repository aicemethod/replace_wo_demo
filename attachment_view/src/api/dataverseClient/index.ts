/**
 * Dataverse API クライアント統合エクスポート
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 * - レガシー互換性を保ちながら、新しいクラスベースAPIも提供
 */

// レガシー互換性のための関数型API
import { optionSetClient } from "./optionSetClient";
import { timeEntryClient } from "./timeEntryClient";
import { workOrderClient } from "./workOrderClient";
import { subcategoryClient } from "./subcategoryClient";
import { taskClient } from "./taskClient";
import { resourceClient } from "./resourceClient";
import { userClient } from "./userClient";

// 新しいクラスベースAPI
import { OptionSetClient } from "./optionSetClient";
import { TimeEntryClient } from "./timeEntryClient";
import { WorkOrderClient } from "./workOrderClient";
import { SubCategoryClient } from "./subcategoryClient";
import { TaskClient } from "./taskClient";
import { ResourceClient } from "./resourceClient";
import { UserClient } from "./userClient";

// 共通型とユーティリティ
export * from "./core/types";
export * from "./core/utils";
export * from "./config";
export * from "./data/mockData";

/**
 * レガシー互換性のための統合クライアント
 * - 既存のコードとの互換性を保つ
 */
export const dataverseClient = {
    ...optionSetClient,
    ...timeEntryClient,
    ...workOrderClient,
    ...subcategoryClient,
    ...taskClient,
    ...resourceClient,
    ...userClient,
};

/**
 * 新しいクラスベースAPI
 * - より型安全で拡張可能な実装
 */
export const DataverseClients = {
    OptionSet: OptionSetClient,
    TimeEntry: TimeEntryClient,
    WorkOrder: WorkOrderClient,
    SubCategory: SubCategoryClient,
    Task: TaskClient,
    Resource: ResourceClient,
    User: UserClient,
};

// 個別クライアントのエクスポート（レガシー互換性）
export {
    optionSetClient,
    timeEntryClient,
    workOrderClient,
    subcategoryClient,
    taskClient,
    resourceClient,
    userClient,
};

// 新しいクラスベースクライアントのエクスポート
export {
    OptionSetClient,
    TimeEntryClient,
    WorkOrderClient,
    SubCategoryClient,
    TaskClient,
    ResourceClient,
    UserClient,
};
