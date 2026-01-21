/**
 * TimeEntry の Dataverse API クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import { BaseClient } from './core/BaseClient';
import type { BaseEntity, QueryOptions } from './core/types';
import { getConfig } from './config';
import { MOCK_TIME_ENTRIES, MockDataHelper } from './data/mockData';
import { DataTransformer } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** TimeEntry 登録・更新時の入力データ型 */
export interface TimeEntryInput {
    title?: string;
    mainCategory?: string | number | null;
    timeCategory?: string | number | null;
    subcategory?: string | null; // Lookup ID
    paymentType?: string | number | null;
    timezone?: string | number | null;
    start?: Date;
    end?: Date;
    wo?: string; // WorkOrder ID
    endUser?: string | null; // Lookup ID
    deviceSn?: string | null; // Lookup ID
    woType?: string | null; // Lookup ID
    paymentMainCategory?: string | number | null;
}

/** Dataverse 登録・更新後の返却型 */
export interface TimeEntryRecord extends BaseEntity {
    title: string;
    mainCategory: number | null;
    timeCategory: number | null;
    subcategory: number | null;
    paymentType: number | null;
    timezone: number | null;
    start: string;
    end: string;
    wo?: string;
}

/** タイムエントリクライアントクラス */
export class TimeEntryClient extends BaseClient<TimeEntryRecord, TimeEntryInput> {
    constructor() {
        super('proto_timeentry', getConfig());
    }

    /** タイムエントリ一覧取得の内部実装 */
    protected async getEntitiesInternal(queryOptions?: QueryOptions): Promise<TimeEntryRecord[]> {
        if (this.isLocalEnvironment()) {
            return this.getMockData();
        }

        return await this.executeDataverseOperation(async () => {
            const query = this.buildQueryString({
                select: [
                    'proto_timeentryid',
                    'proto_name',
                    'proto_maincategory',
                    'proto_timecategory',
                    'proto_subcategory',
                    'proto_paymenttype',
                    'proto_timezone',
                    'proto_startdatetime',
                    'proto_enddatetime',
                    '_proto_wonumber_value'
                ],
                ...queryOptions
            });

            const result = await this.getXrm().WebApi.retrieveMultipleRecords(this.entityName, query);
            return DataTransformer.mapRecords(result.entities, this.transformRecord);
        }, 'getEntities');
    }

    /** タイムエントリ作成の内部実装 */
    protected async createEntityInternal(data: TimeEntryInput): Promise<TimeEntryRecord> {
        if (this.isLocalEnvironment()) {
            const newTimeEntry: TimeEntryRecord = {
                id: MockDataHelper.generateId('timeentry'),
                name: data.title || 'Onsite Work',
                title: data.title || 'Onsite Work',
                mainCategory: DataTransformer.toOptionSetNumber(data.mainCategory),
                timeCategory: DataTransformer.toOptionSetNumber(data.timeCategory),
                subcategory: DataTransformer.toOptionSetNumber(data.subcategory),
                paymentType: DataTransformer.toOptionSetNumber(data.paymentType),
                timezone: DataTransformer.toOptionSetNumber(data.timezone),
                start: DataTransformer.toIsoString(data.start),
                end: DataTransformer.toIsoString(data.end),
                wo: data.wo
            };
            return newTimeEntry;
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {
                proto_name: data.title || 'Onsite Work',
                proto_maincategory: DataTransformer.toOptionSetNumber(data.mainCategory),
                proto_timecategory: DataTransformer.toOptionSetNumber(data.timeCategory),
                proto_paymenttype: DataTransformer.toOptionSetNumber(data.paymentType),
                proto_timezone: DataTransformer.toOptionSetNumber(data.timezone),
                proto_startdatetime: DataTransformer.toIsoString(data.start),
                proto_enddatetime: DataTransformer.toIsoString(data.end)
            };

            // Lookupフィールドの処理（空文字列やnullの場合は設定しない）
            if (data.subcategory && data.subcategory !== "" && data.subcategory !== null) {
                payload['proto_subcategory@odata.bind'] = `/proto_subcategories(${data.subcategory})`;
            }
            // EndUser は一時的に登録対象から除外（エラー回避のため）
            // if (data.endUser && data.endUser !== "" && data.endUser !== null) {
            //     // EndUser は account エンティティへの Lookup
            //     payload['proto_enduser@odata.bind'] = `/accounts(${data.endUser})`;
            // }
            if (data.deviceSn && data.deviceSn !== "" && data.deviceSn !== null) {
                // proto_devicesearch フィールドは proto_nonyudevice エンティティへの Lookup
                payload['proto_devicesearch@odata.bind'] = `/proto_nonyudevices(${data.deviceSn})`;
            }
            if (data.woType && data.woType !== "" && data.woType !== null) {
                payload['proto_wotype@odata.bind'] = `/proto_wotypes(${data.woType})`;
            }
            if (data.paymentMainCategory !== undefined && data.paymentMainCategory !== null) {
                const paymentMainCategoryValue = DataTransformer.toOptionSetNumber(data.paymentMainCategory);
                if (paymentMainCategoryValue !== null) {
                    payload.proto_paymentmaincategory = paymentMainCategoryValue;
                }
            }

            if (data.wo && data.wo !== "" && data.wo !== null) {
                payload['proto_wonumber@odata.bind'] = `/proto_workorders(${data.wo})`;
            }

            console.log('TimeEntry作成ペイロード:', JSON.stringify(payload, null, 2));

            try {
                const result = await this.getXrm().WebApi.createRecord(this.entityName, payload);
                return {
                    id: result.id,
                    name: data.title || 'Onsite Work',
                    title: data.title || 'Onsite Work',
                    mainCategory: DataTransformer.toOptionSetNumber(data.mainCategory),
                    timeCategory: DataTransformer.toOptionSetNumber(data.timeCategory),
                    subcategory: data.subcategory ? (typeof data.subcategory === 'string' ? null : Number(data.subcategory)) : null,
                    paymentType: DataTransformer.toOptionSetNumber(data.paymentType),
                    timezone: DataTransformer.toOptionSetNumber(data.timezone),
                    start: DataTransformer.toIsoString(data.start),
                    end: DataTransformer.toIsoString(data.end),
                    wo: data.wo
                };
            } catch (error: any) {
                console.error('TimeEntry作成エラー詳細:', error);
                console.error('エラーメッセージ:', error?.message || error?.error?.message || error);
                throw error;
            }
        }, 'createEntity');
    }

    /** タイムエントリ更新の内部実装 */
    protected async updateEntityInternal(id: string, data: Partial<TimeEntryInput>): Promise<TimeEntryRecord> {
        if (this.isLocalEnvironment()) {
            const existing = MockDataHelper.getTimeEntryById(id);
            if (!existing) throw new Error('タイムエントリが見つかりません');
            return { ...existing, ...data } as TimeEntryRecord;
        }

        return await this.executeDataverseOperation(async () => {
            const payload: any = {};
            if (data.title !== undefined) payload.proto_name = data.title;
            if (data.mainCategory !== undefined) payload.proto_maincategory = DataTransformer.toOptionSetNumber(data.mainCategory);
            if (data.timeCategory !== undefined) payload.proto_timecategory = DataTransformer.toOptionSetNumber(data.timeCategory);
            if (data.paymentType !== undefined) payload.proto_paymenttype = DataTransformer.toOptionSetNumber(data.paymentType);
            if (data.timezone !== undefined) payload.proto_timezone = DataTransformer.toOptionSetNumber(data.timezone);
            if (data.start !== undefined) payload.proto_startdatetime = DataTransformer.toIsoString(data.start);
            if (data.end !== undefined) payload.proto_enddatetime = DataTransformer.toIsoString(data.end);

            // Lookupフィールドの処理（空文字列やnullの場合は設定しない）
            if (data.subcategory !== undefined && data.subcategory !== null && data.subcategory !== "") {
                payload['proto_subcategory@odata.bind'] = `/proto_subcategories(${data.subcategory})`;
            }
            // EndUser は一時的に更新対象から除外（エラー回避のため）
            // if (data.endUser !== undefined && data.endUser !== null && data.endUser !== "") {
            //     // EndUser は account エンティティへの Lookup
            //     payload['proto_enduser@odata.bind'] = `/accounts(${data.endUser})`;
            // }
            if (data.deviceSn !== undefined && data.deviceSn !== null && data.deviceSn !== "") {
                // proto_devicesearch フィールドは proto_nonyudevice エンティティへの Lookup
                payload['proto_devicesearch@odata.bind'] = `/proto_nonyudevices(${data.deviceSn})`;
            }
            if (data.woType !== undefined && data.woType !== null && data.woType !== "") {
                payload['proto_wotype@odata.bind'] = `/proto_wotypes(${data.woType})`;
            }
            if (data.paymentMainCategory !== undefined && data.paymentMainCategory !== null) {
                const paymentMainCategoryValue = DataTransformer.toOptionSetNumber(data.paymentMainCategory);
                if (paymentMainCategoryValue !== null) {
                    payload.proto_paymentmaincategory = paymentMainCategoryValue;
                }
            }

            if (data.wo !== undefined) {
                if (data.wo) {
                    payload['proto_wonumber@odata.bind'] = `/proto_workorders(${data.wo})`;
                } else {
                    payload['proto_wonumber@odata.bind'] = null;
                }
            }

            await this.getXrm().WebApi.updateRecord(this.entityName, id, payload);
            return { id, name: data.title || '', title: data.title || '', ...data } as unknown as TimeEntryRecord;
        }, 'updateEntity');
    }

    /** タイムエントリ削除の内部実装 */
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
    protected getMockData(): TimeEntryRecord[] {
        return MOCK_TIME_ENTRIES;
    }

    /** レコード変換 */
    protected transformRecord(record: any): TimeEntryRecord {
        return {
            id: record.proto_timeentryid,
            name: record.proto_name || '',
            title: record.proto_name || '',
            mainCategory: record.proto_maincategory,
            timeCategory: record.proto_timecategory,
            subcategory: record.proto_subcategory,
            paymentType: record.proto_paymenttype,
            timezone: record.proto_timezone,
            start: record.proto_startdatetime || '',
            end: record.proto_enddatetime || '',
            wo: record._proto_wonumber_value
        };
    }

    /** 入力データ検証 */
    protected validateInput(data: TimeEntryInput): void {
        if (data.start && data.end && new Date(data.start) >= new Date(data.end)) {
            throw new Error('開始時刻は終了時刻より前である必要があります');
        }
    }

    /** Xrm インスタンス取得 */
    private getXrm() {
        getXrm();
        return getXrm();
    }
}

/** レガシー互換性のための関数型API */
export const timeEntryClient = {
    /** 新規登録 */
    async createTimeEntry(data: TimeEntryInput): Promise<TimeEntryRecord> {
        const client = new TimeEntryClient();
        const response = await client.createEntity(data);
        if (!response.success) {
            throw new Error(response.error || 'タイムエントリの作成に失敗しました');
        }
        return response.data;
    },

    /** 更新 */
    async updateTimeEntry(id: string, data: TimeEntryInput): Promise<TimeEntryRecord> {
        const client = new TimeEntryClient();
        const response = await client.updateEntity(id, data);
        if (!response.success) {
            throw new Error(response.error || 'タイムエントリの更新に失敗しました');
        }
        return response.data;
    },

    /** 削除 */
    async deleteTimeEntry(id: string): Promise<void> {
        const client = new TimeEntryClient();
        const response = await client.deleteEntity(id);
        if (!response.success) {
            throw new Error(response.error || 'タイムエントリの削除に失敗しました');
        }
    }
};
