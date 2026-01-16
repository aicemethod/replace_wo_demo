/**
 * Dataverse ユーザー情報取得クライアント
 * - 新しいアーキテクチャに基づく型安全で拡張可能な実装
 */

import type { BaseEntity, ApiResponse } from './core/types';
import { getConfig } from './config';
import { MOCK_CURRENT_USER } from './data/mockData';
import { Logger, ErrorHandler, ResponseBuilder } from './core/utils';
import { getXrm } from '../../utils/xrmUtils';

/** ユーザー情報の型定義 */
export interface UserRecord extends BaseEntity {
    firstName: string;        // 名（proto_mei）
    lastName: string;         // 姓（proto_sei）
    employeeId?: string;      // 任意（必要に応じて）
}

/** ユーザークライアントクラス */
export class UserClient {
    private readonly config = getConfig();
    private readonly logger = Logger.getInstance(this.config);

    constructor() { }

    /** 現在のユーザー情報を取得 */
    async getCurrentUser(): Promise<ApiResponse<UserRecord>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: '現在のユーザー情報取得開始',
                timestamp: Date.now(),
                entityName: 'user',
                operation: 'getCurrentUser'
            });

            const user = await this.getCurrentUserInternal();
            return ResponseBuilder.success(user);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, 'user', 'getCurrentUser');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** 現在のユーザー情報取得の内部実装 */
    private async getCurrentUserInternal(): Promise<UserRecord> {
        const xrm = getXrm();

        // ローカル環境（Dataverseなしの場合）
        if (!xrm || this.config.enableMockData) {
            return MOCK_CURRENT_USER;
        }

        // ログイン中のユーザーIDを取得
        const globalCtx = xrm.Utility.getGlobalContext();
        const userId = globalCtx.userSettings.userId.replace(/[{}]/g, "");

        // proto_bookableresource から、対応するユーザーIDのレコードを検索
        const query = `?$select=proto_bookableresourceid,_proto_systemuser_value,proto_shimei,proto_sei,proto_mei
                       &$filter=_proto_systemuser_value eq ${userId}`;

        const result = await xrm.WebApi.retrieveMultipleRecords(
            "proto_bookableresource",
            query
        );

        if (!result.entities.length) {
            throw new Error("対応する proto_bookableresource レコードが見つかりません。");
        }

        const record = result.entities[0];

        return {
            id: record.proto_bookableresourceid,
            name: `${record.proto_sei ?? ""} ${record.proto_mei ?? ""}`.trim(),
            firstName: record.proto_mei ?? "",
            lastName: record.proto_sei ?? "",
            employeeId: record.proto_shimei ?? "", // ※社員番号ではなく氏名（必要に応じて変更可）
        };
    }
}

/** レガシー互換性のための関数型API */
export const userClient = {
    /** 現在のユーザー情報を取得 */
    async getCurrentUser(): Promise<UserRecord> {
        const client = new UserClient();
        const response = await client.getCurrentUser();
        if (!response.success) {
            throw new Error(response.error || 'ユーザー情報の取得に失敗しました');
        }
        return response.data;
    }
};
