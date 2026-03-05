/**
 * WorkOrder 関連の Dataverse API クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import { BaseClient } from './core/BaseClient';
import type { BaseEntity, QueryOptions } from './core/types';
import { getConfig } from './config';
import { MOCK_WORK_ORDERS, MockDataHelper } from './data/mockData';
import { DataTransformer } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** WorkOrder データ型 */
export interface WorkOrder extends BaseEntity {
    // BaseEntity の id と name を継承
}

/** ワークオーダー作成・更新用の入力型 */
export interface WorkOrderInput {
    name: string;
}

/** ワークオーダークライアントクラス */
export class WorkOrderClient extends BaseClient<WorkOrder, WorkOrderInput> {
    constructor() {
        super('proto_workorder', getConfig());
    }

    /** ワークオーダー一覧取得の内部実装 */
    protected async getEntitiesInternal(queryOptions?: QueryOptions): Promise<WorkOrder[]> {
        if (this.isLocalEnvironment()) {
            return this.getMockData();
        }

        return await this.executeDataverseOperation(async () => {
            const xrm = this.getXrm();
            const userId = xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, "");

            // proto_resource からログインユーザーに紐づく proto_workorder(lookup) を取得
            const resourceQuery = this.buildQueryString({
                select: ['_proto_workorder_value'],
                filter: `_proto_resource1_value eq ${userId} and _proto_workorder_value ne null`,
            });

            const resourceResult = await xrm.WebApi.retrieveMultipleRecords("proto_resource", resourceQuery);
            const workOrderIds = Array.from(
                new Set(
                    resourceResult.entities
                        .map((record: any) => (record._proto_workorder_value || "").replace(/[{}]/g, ""))
                        .filter((id: string) => id.length > 0)
                )
            );

            if (workOrderIds.length === 0) {
                return [];
            }

            const workOrderFilter = workOrderIds
                .map((id) => `proto_workorderid eq ${id}`)
                .join(" or ");
            const mergedFilter = queryOptions?.filter
                ? `(${workOrderFilter}) and (${queryOptions.filter})`
                : workOrderFilter;

            const query = this.buildQueryString({
                ...queryOptions,
                select: queryOptions?.select ?? ['proto_workorderid', 'proto_wonumber'],
                filter: mergedFilter,
                orderBy: queryOptions?.orderBy ?? "proto_wonumber",
            });

            const result = await xrm.WebApi.retrieveMultipleRecords(this.entityName, query);
            return DataTransformer.mapRecords(result.entities, this.transformRecord);
        }, 'getEntities');
    }

    /** ワークオーダー作成の内部実装 */
    protected async createEntityInternal(data: WorkOrderInput): Promise<WorkOrder> {
        if (this.isLocalEnvironment()) {
            const newWorkOrder: WorkOrder = {
                id: MockDataHelper.generateId('workorder'),
                name: data.name
            };
            return newWorkOrder;
        }

        return await this.executeDataverseOperation(async () => {
            const payload = {
                proto_wonumber: data.name
            };

            const result = await this.getXrm().WebApi.createRecord(this.entityName, payload);
            return { id: result.id, name: data.name };
        }, 'createEntity');
    }

    /** ワークオーダー更新の内部実装 */
    protected async updateEntityInternal(id: string, data: Partial<WorkOrderInput>): Promise<WorkOrder> {
        if (this.isLocalEnvironment()) {
            const existing = MockDataHelper.getWorkOrderById(id);
            if (!existing) throw new Error('ワークオーダーが見つかりません');
            return { ...existing, ...data };
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {};
            if (data.name) payload.proto_wonumber = data.name;

            await this.getXrm().WebApi.updateRecord(this.entityName, id, payload);
            return { id, name: data.name || '' } as WorkOrder;
        }, 'updateEntity');
    }

    /** ワークオーダー削除の内部実装 */
    protected async deleteEntityInternal(id: string): Promise<void> {
        if (this.isLocalEnvironment()) {
            // ローカル環境では何もしない（モックデータは変更しない）
            return;
        }

        await this.executeDataverseOperation(async () => {
            await this.getXrm().WebApi.deleteRecord(this.entityName, id);
        }, 'deleteEntity');
    }

    /** モックデータ取得 */
    protected getMockData(): WorkOrder[] {
        return MOCK_WORK_ORDERS;
    }

    /** レコード変換 */
    protected transformRecord(record: any): WorkOrder {
        return {
            id: record.proto_workorderid,
            name: record.proto_wonumber || ''
        };
    }

    /** 入力データ検証 */
    protected validateInput(data: WorkOrderInput): void {
        if (!data.name || data.name.trim() === '') {
            throw new Error('ワークオーダー名は必須です');
        }
    }

    /** Xrm インスタンス取得 */
    private getXrm() {
        getXrm();
        return getXrm();
    }
}

/** レガシー互換性のための関数型API */
export const workOrderClient = {
    /** ワークオーダー一覧取得 */
    async getWorkOrders(): Promise<WorkOrder[]> {
        const client = new WorkOrderClient();
        const response = await client.getEntities();
        return response.success ? response.data : [];
    }
};
