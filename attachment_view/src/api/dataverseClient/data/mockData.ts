/**
 * モックデータ管理
 * - 開発・テスト環境用のサンプルデータを一元管理
 */

import type { BaseEntity } from '../core/types';

/** リソース（BookableResource）のモックデータ */
export const MOCK_RESOURCES = [
    { id: "1", name: "田中 太郎", number: "0001", lastName: "田中", firstName: "太郎", fullName: "田中 太郎" },
    { id: "2", name: "佐藤 花子", number: "0002", lastName: "佐藤", firstName: "花子", fullName: "佐藤 花子" },
    { id: "3", name: "鈴木 次郎", number: "0003", lastName: "鈴木", firstName: "次郎", fullName: "鈴木 次郎" },
    { id: "4", name: "高橋 美咲", number: "0004", lastName: "高橋", firstName: "美咲", fullName: "高橋 美咲" },
    { id: "5", name: "山田 健一", number: "0005", lastName: "山田", firstName: "健一", fullName: "山田 健一" },
    { id: "6", name: "伊藤 優子", number: "0006", lastName: "伊藤", firstName: "優子", fullName: "伊藤 優子" },
    { id: "7", name: "渡辺 一郎", number: "0007", lastName: "渡辺", firstName: "一郎", fullName: "渡辺 一郎" },
    { id: "8", name: "小林 二郎", number: "0008", lastName: "小林", firstName: "二郎", fullName: "小林 二郎" },
    { id: "9", name: "加藤 三郎", number: "0009", lastName: "加藤", firstName: "三郎", fullName: "加藤 三郎" },
    { id: "10", name: "吉田 四郎", number: "0010", lastName: "吉田", firstName: "四郎", fullName: "吉田 四郎" },
    { id: "11", name: "山本 五郎", number: "0011", lastName: "山本", firstName: "五郎", fullName: "山本 五郎" },
    { id: "12", name: "森 六郎", number: "0012", lastName: "森", firstName: "六郎", fullName: "森 六郎" },
    { id: "13", name: "林 七郎", number: "0013", lastName: "林", firstName: "七郎", fullName: "林 七郎" },
    { id: "14", name: "山口 八郎", number: "0014", lastName: "山口", firstName: "八郎", fullName: "山口 八郎" },
    { id: "15", name: "佐々木 九郎", number: "0015", lastName: "佐々木", firstName: "九郎", fullName: "佐々木 九郎" },
    { id: "16", name: "高木 十郎", number: "0016", lastName: "高木", firstName: "十郎", fullName: "高木 十郎" },
    { id: "17", name: "原 十一郎", number: "0017", lastName: "原", firstName: "十一郎", fullName: "原 十一郎" },
    { id: "18", name: "中村 十二郎", number: "0018", lastName: "中村", firstName: "十二郎", fullName: "中村 十二郎" },
    { id: "19", name: "小川 十三郎", number: "0019", lastName: "小川", firstName: "十三郎", fullName: "小川 十三郎" },
    { id: "20", name: "中井 十四郎", number: "0020", lastName: "中井", firstName: "十四郎", fullName: "中井 十四郎" },
    { id: "21", name: "近藤 十五郎", number: "0021", lastName: "近藤", firstName: "十五郎", fullName: "近藤 十五郎" },
    { id: "22", name: "村上 十六郎", number: "0022", lastName: "村上", firstName: "十六郎", fullName: "村上 十六郎" },
    { id: "23", name: "松本 十七郎", number: "0023", lastName: "松本", firstName: "十七郎", fullName: "松本 十七郎" },
    { id: "24", name: "伊藤 十八郎", number: "0024", lastName: "伊藤", firstName: "十八郎", fullName: "伊藤 十八郎" },
    { id: "25", name: "佐藤 十九郎", number: "0025", lastName: "佐藤", firstName: "十九郎", fullName: "佐藤 十九郎" },
    { id: "26", name: "小林 二十郎", number: "0026", lastName: "小林", firstName: "二十郎", fullName: "小林 二十郎" },
    { id: "27", name: "加藤 二十一郎", number: "0027", lastName: "加藤", firstName: "二十一郎", fullName: "加藤 二十一郎" },
    { id: "28", name: "吉田 二十二郎", number: "0028", lastName: "吉田", firstName: "二十二郎", fullName: "吉田 二十二郎" },
    { id: "29", name: "山田 二十三郎", number: "0029", lastName: "山田", firstName: "二十三郎", fullName: "山田 二十三郎" },
    { id: "30", name: "伊藤 二十四郎", number: "0030", lastName: "伊藤", firstName: "二十四郎", fullName: "伊藤 二十四郎" },
    { id: "31", name: "佐藤 二十五郎", number: "0031", lastName: "佐藤", firstName: "二十五郎", fullName: "佐藤 二十五郎" },
];

/** サブカテゴリのモックデータ */
export const MOCK_SUBCATEGORIES = [
    { id: "sub-001", name: "教育・研修" },
    { id: "sub-002", name: "品質改善" },
    { id: "sub-003", name: "業務効率化" },
    { id: "sub-004", name: "システム開発" },
    { id: "sub-005", name: "顧客対応" },
    { id: "sub-006", name: "会議・打ち合わせ" }
];

/** タスクのモックデータ */
export const MOCK_TASKS = [
    { id: "task-001", name: "資料作成", subcategoryId: "sub-001" },
    { id: "task-002", name: "会議準備", subcategoryId: "sub-006" },
    { id: "task-003", name: "品質テスト", subcategoryId: "sub-002" },
    { id: "task-004", name: "コードレビュー", subcategoryId: "sub-004" },
    { id: "task-005", name: "顧客ヒアリング", subcategoryId: "sub-005" },
    { id: "task-006", name: "プロセス改善", subcategoryId: "sub-003" }
];

/** ワークオーダーのモックデータ */
export const MOCK_WORK_ORDERS = [
    { id: "wo-001", name: "システム改修プロジェクト" },
    { id: "wo-002", name: "新機能開発" },
    { id: "wo-003", name: "バグ修正対応" },
    { id: "wo-004", name: "パフォーマンス改善" },
    { id: "wo-005", name: "セキュリティ強化" }
];

/** ユーザー情報のモックデータ */
export const MOCK_CURRENT_USER = {
    id: "local-resource",
    name: "テスト 太郎",
    firstName: "太郎",
    lastName: "テスト",
    employeeId: "999999"
};

/** タイムゾーンのモックデータ */
export const MOCK_TIMEZONES = [
    { value: "1", label: "東京 (UTC+9)" },
    { value: "2", label: "ニューヨーク (UTC-5)" },
    { value: "3", label: "ロンドン (UTC+0)" },
    { value: "4", label: "シドニー (UTC+10)" },
    { value: "5", label: "ロサンゼルス (UTC-8)" }
];

/** オプションセットのモックデータ */
export const MOCK_OPTION_SETS = {
    mainCategory: [
        { value: "1", label: "開発" },
        { value: "2", label: "テスト" },
        { value: "3", label: "運用" },
        { value: "4", label: "管理" }
    ],
    timeCategory: [
        { value: "1", label: "通常勤務" },
        { value: "2", label: "残業" },
        { value: "3", label: "休日出勤" },
        { value: "4", label: "有給休暇" }
    ],
    subcategory: [
        { value: "1", label: "教育・研修" },
        { value: "2", label: "品質改善" },
        { value: "3", label: "業務効率化" },
        { value: "4", label: "システム開発" },
        { value: "5", label: "顧客対応" },
        { value: "6", label: "会議・打ち合わせ" }
    ],
    paymentType: [
        { value: "1", label: "有償" },
        { value: "2", label: "無償" },
        { value: "3", label: "研修" }
    ]
};

/** タイムエントリのモックデータ */
export const MOCK_TIME_ENTRIES = [
    {
        id: "te-001",
        name: "システム開発",
        title: "システム開発",
        mainCategory: 1,
        timeCategory: 1,
        subcategory: 4,
        paymentType: 1,
        timezone: 1,
        start: "2024-01-15T09:00:00",
        end: "2024-01-15T18:00:00",
        wo: "wo-001"
    },
    {
        id: "te-002",
        name: "コードレビュー",
        title: "コードレビュー",
        mainCategory: 1,
        timeCategory: 2,
        subcategory: 4,
        paymentType: 1,
        timezone: 1,
        start: "2024-01-15T19:00:00",
        end: "2024-01-15T21:00:00",
        wo: "wo-002"
    }
];

/** モックデータ取得のヘルパー関数 */
export class MockDataHelper {
    /** 指定されたIDのリソースを取得 */
    static getResourceById(id: string) {
        return MOCK_RESOURCES.find(r => r.id === id);
    }

    /** 指定されたIDのサブカテゴリを取得 */
    static getSubcategoryById(id: string) {
        return MOCK_SUBCATEGORIES.find(s => s.id === id);
    }

    /** 指定されたIDのタスクを取得 */
    static getTaskById(id: string) {
        return MOCK_TASKS.find(t => t.id === id);
    }

    /** 指定されたIDのワークオーダーを取得 */
    static getWorkOrderById(id: string) {
        return MOCK_WORK_ORDERS.find(w => w.id === id);
    }

    /** 指定されたIDのタイムエントリを取得 */
    static getTimeEntryById(id: string) {
        return MOCK_TIME_ENTRIES.find(t => t.id === id);
    }

    /** ランダムなIDを生成 */
    static generateId(prefix: string = 'item'): string {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /** 指定された型のモックデータを取得 */
    static getMockData<T extends BaseEntity>(type: string): T[] {
        switch (type) {
            case 'resources':
                return MOCK_RESOURCES as unknown as T[];
            case 'subcategories':
                return MOCK_SUBCATEGORIES as unknown as T[];
            case 'tasks':
                return MOCK_TASKS as unknown as T[];
            case 'workorders':
                return MOCK_WORK_ORDERS as unknown as T[];
            case 'timeentries':
                return MOCK_TIME_ENTRIES as unknown as T[];
            default:
                return [];
        }
    }
}
