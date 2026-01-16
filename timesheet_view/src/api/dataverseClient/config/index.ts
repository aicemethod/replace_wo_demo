/**
 * Dataverse API クライアント設定管理
 * - 環境別設定、モックデータ、定数の一元管理
 */

import type { ClientConfig } from '../core/types';
import { DEFAULT_CONFIG } from '../core/types';

/** 環境別設定 */
export const ENVIRONMENT_CONFIGS = {
    development: {
        ...DEFAULT_CONFIG,
        enableLogging: true,
        logLevel: 'DEBUG' as any,
        enableMockData: true,
        timeout: 10000
    },
    production: {
        ...DEFAULT_CONFIG,
        enableLogging: false,
        logLevel: 'ERROR' as any,
        enableMockData: false,
        timeout: 30000
    },
    test: {
        ...DEFAULT_CONFIG,
        enableLogging: true,
        logLevel: 'WARN' as any,
        enableMockData: true,
        timeout: 5000
    }
};

/** 現在の環境を取得 */
export function getCurrentEnvironment(): keyof typeof ENVIRONMENT_CONFIGS {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'development';
    }
    return 'production';
}

/** 環境に応じた設定を取得 */
export function getConfig(): ClientConfig {
    const env = getCurrentEnvironment();
    return ENVIRONMENT_CONFIGS[env];
}
