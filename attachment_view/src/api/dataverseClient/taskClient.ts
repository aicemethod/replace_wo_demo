/**
 * Task 関連 Dataverse クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import { BaseClient } from './core/BaseClient';
import type { BaseEntity, QueryOptions } from './core/types';
import { getConfig } from './config';
import { MOCK_TASKS, MockDataHelper } from './data/mockData';
import { DataTransformer } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** Task データ型 */
export interface Task extends BaseEntity {
    subcategoryId?: string;
}

/** タスク作成・更新用の入力型 */
export interface TaskInput {
    name: string;
    subcategoryId?: string;
}

/** タスククライアントクラス */
export class TaskClient extends BaseClient<Task, TaskInput> {
    constructor() {
        super('proto_task', getConfig());
    }

    /** タスク一覧取得の内部実装 */
    protected async getEntitiesInternal(queryOptions?: QueryOptions): Promise<Task[]> {
        if (this.isLocalEnvironment()) {
            return this.getMockData();
        }

        return await this.executeDataverseOperation(async () => {
            const query = this.buildQueryString({
                select: ['proto_taskid', 'proto_name'],
                ...queryOptions
            });

            const result = await this.getXrm().WebApi.retrieveMultipleRecords(this.entityName, query);
            return DataTransformer.mapRecords(result.entities, this.transformRecord);
        }, 'getEntities');
    }

    /** タスク作成の内部実装 */
    protected async createEntityInternal(data: TaskInput): Promise<Task> {
        if (this.isLocalEnvironment()) {
            const newTask: Task = {
                id: MockDataHelper.generateId('task'),
                name: data.name,
                subcategoryId: data.subcategoryId
            };
            return newTask;
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {
                proto_name: data.name
            };

            if (data.subcategoryId) {
                payload['proto_subcategory@odata.bind'] = `/proto_subcategories(${data.subcategoryId})`;
            }

            const result = await this.getXrm().WebApi.createRecord(this.entityName, payload);
            return { id: result.id, name: data.name, subcategoryId: data.subcategoryId };
        }, 'createEntity');
    }

    /** タスク更新の内部実装 */
    protected async updateEntityInternal(id: string, data: Partial<TaskInput>): Promise<Task> {
        if (this.isLocalEnvironment()) {
            const existing = MockDataHelper.getTaskById(id);
            if (!existing) throw new Error('タスクが見つかりません');
            return { ...existing, ...data };
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {};
            if (data.name) payload.proto_name = data.name;
            if (data.subcategoryId !== undefined) {
                if (data.subcategoryId) {
                    payload['proto_subcategory@odata.bind'] = `/proto_subcategories(${data.subcategoryId})`;
                } else {
                    payload['proto_subcategory@odata.bind'] = null;
                }
            }

            await this.getXrm().WebApi.updateRecord(this.entityName, id, payload);
            return { id, name: data.name || '', subcategoryId: data.subcategoryId } as Task;
        }, 'updateEntity');
    }

    /** タスク削除の内部実装 */
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
    protected getMockData(): Task[] {
        return MOCK_TASKS;
    }

    /** レコード変換 */
    protected transformRecord(record: any): Task {
        return {
            id: record.proto_taskid,
            name: record.proto_name || '',
            // subcategoryId: record._proto_subcategory_value
        };
    }

    /** 入力データ検証 */
    protected validateInput(data: TaskInput): void {
        if (!data.name || data.name.trim() === '') {
            throw new Error('タスク名は必須です');
        }
    }

    /** Xrm インスタンス取得 */
    private getXrm() {
        getXrm();
        return getXrm();
    }
}

/** レガシー互換性のための関数型API */
export const taskClient = {
    /** タスク一覧取得 */
    async getTasks(): Promise<Task[]> {
        const client = new TaskClient();
        const response = await client.getEntities();
        return response.success ? response.data : [];
    }
};
