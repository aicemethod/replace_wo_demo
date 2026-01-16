/**
 * Dataverse API クライアントのベースクラス
 * - 共通処理の抽象化により保守性と拡張性を向上
 */

import { getXrm } from '../../../utils/xrmUtils';
import type {
    BaseEntity,
    QueryOptions,
    ClientConfig,
    ApiResponse
} from './types';
import { DEFAULT_CONFIG, createDataverseError } from './types';
import { Logger, ErrorHandler, ResponseBuilder, withRetry } from './utils';

/** ベースクライアント抽象クラス */
export abstract class BaseClient<TEntity extends BaseEntity, TInput> {
    protected readonly entityName: string;
    protected readonly config: ClientConfig;
    protected readonly logger: Logger;

    constructor(entityName: string, config: ClientConfig = DEFAULT_CONFIG) {
        this.entityName = entityName;
        this.config = config;
        this.logger = Logger.getInstance(config);
    }

    /** エンティティの一覧取得（抽象メソッド） */
    protected abstract getEntitiesInternal(queryOptions?: QueryOptions): Promise<TEntity[]>;

    /** エンティティの作成（抽象メソッド） */
    protected abstract createEntityInternal(data: TInput): Promise<TEntity>;

    /** エンティティの更新（抽象メソッド） */
    protected abstract updateEntityInternal(id: string, data: Partial<TInput>): Promise<TEntity>;

    /** エンティティの削除（抽象メソッド） */
    protected abstract deleteEntityInternal(id: string): Promise<void>;

    /** モックデータ取得（抽象メソッド） */
    protected abstract getMockData(): TEntity[];

    /** データ変換（抽象メソッド） */
    protected abstract transformRecord(record: any): TEntity;

    /** 入力データ検証（抽象メソッド） */
    protected abstract validateInput(data: TInput): void;

    /** エンティティ一覧取得（公開メソッド） */
    public async getEntities(queryOptions?: QueryOptions): Promise<ApiResponse<TEntity[]>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: 'エンティティ一覧取得開始',
                timestamp: Date.now(),
                entityName: this.entityName,
                operation: 'getEntities'
            });

            const entities = await withRetry(
                () => this.getEntitiesInternal(queryOptions),
                this.config.retryAttempts
            );

            return ResponseBuilder.success(entities);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, this.entityName, 'getEntities');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** エンティティ作成（公開メソッド） */
    public async createEntity(data: TInput): Promise<ApiResponse<TEntity>> {
        try {
            this.validateInput(data);

            this.logger.log({
                level: 'INFO' as any,
                message: 'エンティティ作成開始',
                timestamp: Date.now(),
                entityName: this.entityName,
                operation: 'createEntity'
            });

            const entity = await withRetry(
                () => this.createEntityInternal(data),
                this.config.retryAttempts
            );

            return ResponseBuilder.success(entity);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, this.entityName, 'createEntity');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** エンティティ更新（公開メソッド） */
    public async updateEntity(id: string, data: Partial<TInput>): Promise<ApiResponse<TEntity>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: 'エンティティ更新開始',
                timestamp: Date.now(),
                entityName: this.entityName,
                operation: 'updateEntity'
            });

            const entity = await withRetry(
                () => this.updateEntityInternal(id, data),
                this.config.retryAttempts
            );

            return ResponseBuilder.success(entity);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, this.entityName, 'updateEntity');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** エンティティ削除（公開メソッド） */
    public async deleteEntity(id: string): Promise<ApiResponse<void>> {
        try {
            this.logger.log({
                level: 'INFO' as any,
                message: 'エンティティ削除開始',
                timestamp: Date.now(),
                entityName: this.entityName,
                operation: 'deleteEntity'
            });

            await withRetry(
                () => this.deleteEntityInternal(id),
                this.config.retryAttempts
            );

            return ResponseBuilder.success(undefined);
        } catch (error) {
            const dataverseError = ErrorHandler.handle(error, this.entityName, 'deleteEntity');
            return ResponseBuilder.error(dataverseError);
        }
    }

    /** Dataverse環境のチェック */
    protected isDataverseAvailable(): boolean {
        const xrm = getXrm();
        return !!xrm?.WebApi;
    }

    /** ローカル環境かどうかのチェック */
    protected isLocalEnvironment(): boolean {
        return !this.isDataverseAvailable() || this.config.enableMockData;
    }

    /** クエリ文字列の構築 */
    protected buildQueryString(options: QueryOptions = {}): string {
        const params: string[] = [];

        if (options.select?.length) {
            params.push(`$select=${options.select.join(',')}`);
        }

        if (options.filter) {
            params.push(`$filter=${options.filter}`);
        }

        if (options.orderBy) {
            params.push(`$orderby=${options.orderBy}`);
        }

        if (options.top) {
            params.push(`$top=${options.top}`);
        }

        if (options.skip) {
            params.push(`$skip=${options.skip}`);
        }

        if (options.expand?.length) {
            params.push(`$expand=${options.expand.join(',')}`);
        }

        return params.length ? `?${params.join('&')}` : '';
    }

    /** Dataverse API 呼び出しの共通処理 */
    protected async executeDataverseOperation<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        const xrm = getXrm();
        if (!xrm?.WebApi) {
            throw createDataverseError(
                'NETWORK' as any,
                'Dataverse環境が利用できません',
                undefined,
                this.entityName,
                operationName
            );
        }

        return await operation();
    }
}
