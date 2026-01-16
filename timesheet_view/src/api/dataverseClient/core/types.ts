/**
 * Dataverse API クライアント共通型定義
 * - 保守性、可読性、拡張性を向上させるための統一型定義
 */

/** 基本的なエンティティレコードの型 */
export interface BaseEntity {
    id: string;
    name: string;
}

/** API レスポンスの基本型 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: string;
    timestamp: number;
}

/** ページネーション情報 */
export interface PaginationInfo {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
}

/** ページネーション付きレスポンス */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationInfo;
}

/** クエリオプション */
export interface QueryOptions {
    select?: string[];
    filter?: string;
    orderBy?: string;
    top?: number;
    skip?: number;
    expand?: string[];
}

/** 作成・更新用の基本データ型 */
export interface BaseInput {
    id?: string;
    name?: string;
}

/** エラーの種類 */
export const ErrorType = {
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    PERMISSION: 'PERMISSION',
    NOT_FOUND: 'NOT_FOUND',
    SERVER: 'SERVER',
    UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/** カスタムエラー型 */
export interface DataverseError {
    type: ErrorType;
    message: string;
    originalError?: any;
    entityName?: string;
    operation?: string;
    name: string;
}

/** カスタムエラー作成関数 */
export function createDataverseError(
    type: ErrorType,
    message: string,
    originalError?: any,
    entityName?: string,
    operation?: string
): DataverseError {
    return {
        type,
        message,
        originalError,
        entityName,
        operation,
        name: 'DataverseError'
    };
}

/** ログレベル */
export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/** ログエントリ */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: number;
    entityName?: string;
    operation?: string;
    error?: any;
}

/** クライアント設定 */
export interface ClientConfig {
    enableLogging: boolean;
    logLevel: LogLevel;
    enableMockData: boolean;
    timeout: number;
    retryAttempts: number;
}

/** デフォルト設定 */
export const DEFAULT_CONFIG: ClientConfig = {
    enableLogging: true,
    logLevel: LogLevel.INFO,
    enableMockData: false,
    timeout: 30000,
    retryAttempts: 3
};
