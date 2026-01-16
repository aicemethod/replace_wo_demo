/**
 * Dataverse API クライアント共通ユーティリティ
 * - エラーハンドリング、ログ、データ変換の統一処理
 */

import type {
    DataverseError,
    LogEntry,
    ClientConfig,
    ApiResponse
} from './types';
import {
    ErrorType,
    LogLevel,
    DEFAULT_CONFIG,
    createDataverseError
} from './types';

/** ログ管理クラス */
export class Logger {
    private static instance: Logger;
    private config: ClientConfig;

    private constructor(config: ClientConfig = DEFAULT_CONFIG) {
        this.config = config;
    }

    public static getInstance(config?: ClientConfig): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }

    public log(entry: LogEntry): void {
        if (!this.config.enableLogging) return;
        if (this.getLogLevelPriority(entry.level) < this.getLogLevelPriority(this.config.logLevel)) return;

        const timestamp = new Date(entry.timestamp).toISOString();
        const prefix = `[${timestamp}] [${entry.level}]`;
        const context = entry.entityName && entry.operation
            ? `[${entry.entityName}:${entry.operation}]`
            : '';

        const message = `${prefix} ${context} ${entry.message}`;

        switch (entry.level) {
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                console.log(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.ERROR:
                console.error(message, entry.error);
                break;
        }
    }

    private getLogLevelPriority(level: LogLevel): number {
        const priorities = {
            [LogLevel.DEBUG]: 0,
            [LogLevel.INFO]: 1,
            [LogLevel.WARN]: 2,
            [LogLevel.ERROR]: 3
        };
        return priorities[level];
    }
}

/** エラーハンドリングユーティリティ */
export class ErrorHandler {
    public static handle(error: any, entityName?: string, operation?: string): DataverseError {
        const logger = Logger.getInstance();

        let errorType: ErrorType;
        let message: string;

        if (error?.message?.includes('Network')) {
            errorType = ErrorType.NETWORK;
            message = 'ネットワークエラーが発生しました';
        } else if (error?.message?.includes('Permission')) {
            errorType = ErrorType.PERMISSION;
            message = '権限が不足しています';
        } else if (error?.message?.includes('Not Found')) {
            errorType = ErrorType.NOT_FOUND;
            message = 'リソースが見つかりません';
        } else if (error?.message?.includes('Validation')) {
            errorType = ErrorType.VALIDATION;
            message = '入力データが無効です';
        } else {
            errorType = ErrorType.UNKNOWN;
            message = '予期しないエラーが発生しました';
        }

        const dataverseError = createDataverseError(
            errorType,
            message,
            error,
            entityName,
            operation
        );

        logger.log({
            level: LogLevel.ERROR,
            message: `エラー発生: ${message}`,
            timestamp: Date.now(),
            entityName,
            operation,
            error: dataverseError
        });

        return dataverseError;
    }
}

/** データ変換ユーティリティ */
export class DataTransformer {
    /** Date オブジェクトを ISO 文字列に変換（ローカル時間をUTCに正しく変換） */
    public static toIsoString(date?: Date): string {
        if (!date) return '';

        // ローカル時間のDateオブジェクトをUTCに正しく変換
        // toISOString()は自動的にローカル時間をUTCに変換する
        return date.toISOString();
    }

    /** 文字列を数値に安全に変換 */
    public static toNumber(value: string | number | null | undefined): number | null {
        if (value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    }

    /** オプションセット用の数値変換（0や無効な値は除外） */
    public static toOptionSetNumber(value: string | number | null | undefined): number | null {
        if (value === null || value === undefined) return null;
        const num = Number(value);
        // 0や無効な値はnullを返す（Dataverseのオプションセットでは通常1から始まる）
        return (isNaN(num) || num <= 0) ? null : num;
    }

    /** 空文字列を null に変換 */
    public static emptyToNull(value: string | null | undefined): string | null {
        return value === '' ? null : (value ?? null);
    }

    /** レコード配列を指定された型に変換 */
    public static mapRecords<T>(
        records: any[],
        mapper: (record: any) => T
    ): T[] {
        return records.map(mapper).filter(Boolean);
    }
}

/** API レスポンス作成ユーティリティ */
export class ResponseBuilder {
    public static success<T>(data: T): ApiResponse<T> {
        return {
            data,
            success: true,
            timestamp: Date.now()
        };
    }

    public static error<T>(error: DataverseError): ApiResponse<T> {
        return {
            data: null as any,
            success: false,
            error: error.message,
            timestamp: Date.now()
        };
    }
}

/** リトライ機能付き関数実行 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    throw lastError;
}
