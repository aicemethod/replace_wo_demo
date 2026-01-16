/**
 * OptionSet および TimeZone 定義を取得する Dataverse クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import type { ApiResponse } from './core/types';
import { getConfig } from './config';
import { MOCK_OPTION_SETS, MOCK_TIMEZONES } from './data/mockData';
import { Logger, ErrorHandler, ResponseBuilder } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** OptionSet の要素型 */
export interface OptionItem {
    value: string;
    label: string;
}

/** OptionSet 一覧の戻り値型 */
export type OptionSetMap = Record<string, OptionItem[]>;

/** オプションセットクライアントクラス */
export class OptionSetClient {
    private readonly config = getConfig();
    private readonly logger = Logger.getInstance(this.config);

    constructor() { }

    /**
     * 指定されたエンティティと属性フィールドの OptionSet を取得
     * @param entity 対象エンティティ名
     * @param fields 対象フィールド配列
     */
    async getOptionSets(entity: string, fields: string[]): Promise<ApiResponse<OptionSetMap>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: `OptionSet取得開始: ${entity}`,
                timestamp: Date.now(),
                entityName: entity,
                operation: 'getOptionSets'
            });

            const optionSets = await this.getOptionSetsInternal(entity, fields);
            return ResponseBuilder.success(optionSets);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, entity, 'getOptionSets');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /**
     * Dataverse の全タイムゾーン定義を取得
     * @returns タイムゾーン配列（timezonecode, userinterfacename）
     */
    async getTimeZones(): Promise<ApiResponse<OptionItem[]>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: 'タイムゾーン取得開始',
                timestamp: Date.now(),
                entityName: 'timezone',
                operation: 'getTimeZones'
            });

            const timeZones = await this.getTimeZonesInternal();
            return ResponseBuilder.success(timeZones);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, 'timezone', 'getTimeZones');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /**
     * proto_timeentry エンティティのタイムゾーン列を取得
     * - OptionSet列 or Lookup列 のどちらにも対応
     */
    async getProtoTimeEntryTimeZones(): Promise<ApiResponse<OptionItem[]>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: 'proto_timeentryタイムゾーン取得開始',
                timestamp: Date.now(),
                entityName: 'proto_timeentry',
                operation: 'getProtoTimeEntryTimeZones'
            });

            const timeZones = await this.getProtoTimeEntryTimeZonesInternal();
            return ResponseBuilder.success(timeZones);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, 'proto_timeentry', 'getProtoTimeEntryTimeZones');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** OptionSet取得の内部実装 */
    private async getOptionSetsInternal(entity: string, fields: string[]): Promise<OptionSetMap> {
        const xrm = getXrm();

        if (!xrm || this.config.enableMockData) {
            // モックデータを返す
            const mockData: OptionSetMap = {};
            fields.forEach(field => {
                mockData[field] = MOCK_OPTION_SETS[field as keyof typeof MOCK_OPTION_SETS] || [];
            });
            return mockData;
        }

        const metadata = await xrm.Utility.getEntityMetadata(entity, fields);
        if (!metadata?.Attributes) return {};

        // Attributes の取得（Map形式 or 配列形式の両対応）
        const attributes =
            typeof metadata.Attributes.get === "function"
                ? fields.map((f) => metadata.Attributes.get(f)).filter(Boolean)
                : metadata.Attributes;

        /** 単一属性から OptionSet 値一覧を抽出 */
        const getOptions = (logicalName: string): OptionItem[] => {
            const attr = Array.isArray(attributes)
                ? attributes.find((a: any) => a.LogicalName === logicalName)
                : metadata.Attributes.get(logicalName);

            if (!attr?.attributeDescriptor) return [];

            const options = attr.attributeDescriptor.OptionSet || [];
            return options.map((opt: any) => ({
                value: String(opt.Value),
                label: opt.Label || "(ラベル未定義)",
            }));
        };

        // すべての対象フィールドに対して OptionSet を取得
        const result: OptionSetMap = {};
        fields.forEach((field) => {
            result[field] = getOptions(field);
        });

        return result;
    }

    /** タイムゾーン取得の内部実装 */
    private async getTimeZonesInternal(): Promise<OptionItem[]> {
        const xrm = getXrm();

        if (!xrm || this.config.enableMockData) {
            return MOCK_TIMEZONES;
        }

        const result = await xrm.WebApi.retrieveMultipleRecords(
            "timezonedefinition",
            "?$select=timezonecode,userinterfacename"
        );

        return result.entities.map((t: any) => ({
            value: String(t.timezonecode),
            label: t.userinterfacename,
        }));
    }

    /** proto_timeentryタイムゾーン取得の内部実装 */
    private async getProtoTimeEntryTimeZonesInternal(): Promise<OptionItem[]> {
        // まず OptionSet として取得を試みる
        const optionsResponse = await this.getOptionSetsInternal("proto_timeentry", ["proto_timezone"]);
        if (optionsResponse["proto_timezone"]?.length) {
            return optionsResponse["proto_timezone"];
        }

        // OptionSetが存在しない場合は timezonedefinition から取得
        return await this.getTimeZonesInternal();
    }
}

/** レガシー互換性のための関数型API */
export const optionSetClient = {
    /**
     * 指定されたエンティティと属性フィールドの OptionSet を取得
     * @param entity 対象エンティティ名
     * @param fields 対象フィールド配列
     */
    async getOptionSets(entity: string, fields: string[]): Promise<OptionSetMap> {
        const client = new OptionSetClient();
        const response = await client.getOptionSets(entity, fields);
        if (!response.success) {
            throw new Error(response.error || 'OptionSetの取得に失敗しました');
        }
        return response.data;
    },

    /**
     * Dataverse の全タイムゾーン定義を取得
     * @returns タイムゾーン配列（timezonecode, userinterfacename）
     */
    async getTimeZones(): Promise<OptionItem[]> {
        const client = new OptionSetClient();
        const response = await client.getTimeZones();
        if (!response.success) {
            throw new Error(response.error || 'タイムゾーンの取得に失敗しました');
        }
        return response.data;
    },

    /**
     * proto_timeentry エンティティのタイムゾーン列を取得
     * - OptionSet列 or Lookup列 のどちらにも対応
     */
    async getProtoTimeEntryTimeZones(): Promise<OptionItem[]> {
        const client = new OptionSetClient();
        const response = await client.getProtoTimeEntryTimeZones();
        if (!response.success) {
            throw new Error(response.error || 'proto_timeentryタイムゾーンの取得に失敗しました');
        }
        return response.data;
    }
};
