export type TestUser = {
  id: string;
  number: string;
  name: string;
  department?: string;
};

export const TEST_USERS: TestUser[] = [
  { id: 'self', number: 'EMP-000', name: '自分', department: 'General' },
  { id: 'resource-001', number: 'EMP-001', name: '田中 太郎', department: '製造' },
  { id: 'resource-002', number: 'EMP-002', name: '山田 花子', department: '営業' },
  { id: 'resource-003', number: 'EMP-003', name: '佐藤 次郎', department: '経理' },
  { id: 'resource-004', number: 'EMP-004', name: '高橋 真美', department: '人事' },
  { id: 'resource-005', number: 'EMP-005', name: '伊藤 翔', department: '総務' },
  { id: 'resource-006', number: 'EMP-006', name: '小林 明', department: '品質' },
  { id: 'resource-007', number: 'EMP-007', name: '鈴木 未来', department: '開発' },
  { id: 'resource-008', number: 'EMP-008', name: '中村 誠', department: 'IT' },
  { id: 'resource-009', number: 'EMP-009', name: '松本 彩', department: '企画' },
];

