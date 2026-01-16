/**
 * SubCategory 関連 Dataverse クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import { BaseClient } from './core/BaseClient';
import type { BaseEntity, QueryOptions } from './core/types';
import { getConfig } from './config';
import { MOCK_SUBCATEGORIES, MockDataHelper } from './data/mockData';
import { DataTransformer } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** SubCategory データ型 */
export interface SubCategory extends BaseEntity {
    // BaseEntity の id と name を継承
}

/** サブカテゴリ作成・更新用の入力型 */
export interface SubCategoryInput {
    name: string;
}

/** サブカテゴリクライアントクラス */
export class SubCategoryClient extends BaseClient<SubCategory, SubCategoryInput> {
    constructor() {
        super('proto_subcategory', getConfig());
    }

    /** サブカテゴリ一覧取得の内部実装 */
    protected async getEntitiesInternal(queryOptions?: QueryOptions): Promise<SubCategory[]> {
        if (this.isLocalEnvironment()) {
            return this.getMockData();
        }

        return await this.executeDataverseOperation(async () => {
            const query = this.buildQueryString({
                select: ['proto_subcategoryid', 'proto_name'],
                ...queryOptions
            });

            const result = await this.getXrm().WebApi.retrieveMultipleRecords(this.entityName, query);
            return DataTransformer.mapRecords(result.entities, this.transformRecord);
        }, 'getEntities');
    }

    /** サブカテゴリ作成の内部実装 */
    protected async createEntityInternal(data: SubCategoryInput): Promise<SubCategory> {
        if (this.isLocalEnvironment()) {
            const newSubCategory: SubCategory = {
                id: MockDataHelper.generateId('subcategory'),
                name: data.name
            };
            return newSubCategory;
        }

        return await this.executeDataverseOperation(async () => {
            const payload = {
                proto_name: data.name
            };

            const result = await this.getXrm().WebApi.createRecord(this.entityName, payload);
            return { id: result.id, name: data.name };
        }, 'createEntity');
    }

    /** サブカテゴリ更新の内部実装 */
    protected async updateEntityInternal(id: string, data: Partial<SubCategoryInput>): Promise<SubCategory> {
        if (this.isLocalEnvironment()) {
            const existing = MockDataHelper.getSubcategoryById(id);
            if (!existing) throw new Error('サブカテゴリが見つかりません');
            return { ...existing, ...data };
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {};
            if (data.name) payload.proto_name = data.name;

            await this.getXrm().WebApi.updateRecord(this.entityName, id, payload);
            return { id, name: data.name || '' } as SubCategory;
        }, 'updateEntity');
    }

    /** サブカテゴリ削除の内部実装 */
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
    protected getMockData(): SubCategory[] {
        return MOCK_SUBCATEGORIES;
    }

    /** レコード変換 */
    protected transformRecord(record: any): SubCategory {
        return {
            id: record.proto_subcategoryid,
            name: record.proto_name || ''
        };
    }

    /** 入力データ検証 */
    protected validateInput(data: SubCategoryInput): void {
        if (!data.name || data.name.trim() === '') {
            throw new Error('サブカテゴリ名は必須です');
        }
    }

    /** Xrm インスタンス取得 */
    private getXrm() {
        getXrm();
        return getXrm();
    }
}

/** レガシー互換性のための関数型API */
export const subcategoryClient = {
    /** サブカテゴリ一覧取得 */
    async getSubcategories(): Promise<SubCategory[]> {
        const client = new SubCategoryClient();
        const response = await client.getEntities();
        return response.success ? response.data : [];
    }
};
