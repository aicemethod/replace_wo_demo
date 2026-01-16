/**
 * Bookable Resource（リソース）Dataverse クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import { BaseClient } from './core/BaseClient';
import type { BaseEntity, QueryOptions } from './core/types';
import { getConfig } from './config';
import { MOCK_RESOURCES, MockDataHelper } from './data/mockData';
import { DataTransformer } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** Bookable Resource 型定義 */
export interface ResourceRecord extends BaseEntity {
    number?: string;
    lastName?: string;
    firstName?: string;
    fullName?: string;
}

/** リソース作成・更新用の入力型 */
export interface ResourceInput {
    name: string;
    number?: string;
    lastName?: string;
    firstName?: string;
    fullName?: string;
}

/** リソースクライアントクラス */
export class ResourceClient extends BaseClient<ResourceRecord, ResourceInput> {
    constructor() {
        super('proto_bookableresource', getConfig());
    }

    /** リソース一覧取得の内部実装 */
    protected async getEntitiesInternal(queryOptions?: QueryOptions): Promise<ResourceRecord[]> {
        if (this.isLocalEnvironment()) {
            return this.getMockData();
        }

        return await this.executeDataverseOperation(async () => {
            const query = this.buildQueryString({
                select: ['proto_bookableresourceid', 'proto_sei', 'proto_mei', 'proto_shimei', 'proto_name'],
                ...queryOptions
            });

            const result = await this.getXrm().WebApi.retrieveMultipleRecords(this.entityName, query);
            return DataTransformer.mapRecords(result.entities, this.transformRecord);
        }, 'getEntities');
    }

    /** リソース作成の内部実装 */
    protected async createEntityInternal(data: ResourceInput): Promise<ResourceRecord> {
        if (this.isLocalEnvironment()) {
            const newResource: ResourceRecord = {
                id: MockDataHelper.generateId('resource'),
                ...data
            };
            return newResource;
        }

        return await this.executeDataverseOperation(async () => {
            const payload = {
                proto_name: data.name,
                proto_sei: data.lastName,
                proto_mei: data.firstName,
                proto_shimei: data.fullName,
                // proto_employeeid: data.number
            };

            const result = await this.getXrm().WebApi.createRecord(this.entityName, payload);
            return { ...data, id: result.id };
        }, 'createEntity');
    }

    /** リソース更新の内部実装 */
    protected async updateEntityInternal(id: string, data: Partial<ResourceInput>): Promise<ResourceRecord> {
        if (this.isLocalEnvironment()) {
            const existing = MockDataHelper.getResourceById(id);
            if (!existing) throw new Error('リソースが見つかりません');
            return { ...existing, ...data };
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {};
            if (data.name) payload.proto_name = data.name;
            if (data.lastName) payload.proto_sei = data.lastName;
            if (data.firstName) payload.proto_mei = data.firstName;
            if (data.fullName) payload.proto_shimei = data.fullName;
            // if (data.number) payload.proto_employeeid = data.number;

            await this.getXrm().WebApi.updateRecord(this.entityName, id, payload);
            return { id, ...data } as ResourceRecord;
        }, 'updateEntity');
    }

    /** リソース削除の内部実装 */
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
    protected getMockData(): ResourceRecord[] {
        return MOCK_RESOURCES;
    }

    /** レコード変換 */
    protected transformRecord(record: any): ResourceRecord {
        return {
            id: record.proto_bookableresourceid,
            name: record.proto_name || '',
            // number: record.proto_employeeid || '',
            lastName: record.proto_sei || '',
            firstName: record.proto_mei || '',
            fullName: record.proto_shimei || ''
        };
    }

    /** 入力データ検証 */
    protected validateInput(data: ResourceInput): void {
        if (!data.name || data.name.trim() === '') {
            throw new Error('リソース名は必須です');
        }
    }

    /** Xrm インスタンス取得 */
    private getXrm() {
        return getXrm();
    }
}

/** レガシー互換性のための関数型API */
export const resourceClient = {
    /** リソース一覧取得 */
    async getResources(): Promise<ResourceRecord[]> {
        const client = new ResourceClient();
        const response = await client.getEntities();
        return response.success ? response.data : [];
    }
};
