import type { EventInput } from '@fullcalendar/core';

export type CalendarEventData = {
  id: string;
  title: string;
  dayOffset: number; // 週の開始日（月曜日）からの日数オフセット
  hour: number;
  minute?: number;
  durationHours?: number; // 終了時刻を計算するための時間数（デフォルト: 1時間）
  durationMinutes?: number; // 終了時刻を計算するための分数
  category: 'user' | 'task';
};

export const CALENDAR_EVENTS: CalendarEventData[] = [
  {
    id: 'event-standup',
    title: 'デイリースタンドアップ',
    dayOffset: 0,
    hour: 9,
    minute: 30,
    durationHours: 0,
    durationMinutes: 30,
    category: 'user',
  },
  // {
  //   id: 'event-review',
  //   title: '進捗レビュー',
  //   dayOffset: 1,
  //   hour: 13,
  //   durationHours: 2,
  //   category: 'user',
  // },
  // {
  //   id: 'event-sync',
  //   title: 'チーム同期',
  //   dayOffset: 2,
  //   hour: 11,
  //   durationHours: 1,
  //   category: 'user',
  // },
  // {
  //   id: 'event-workshop',
  //   title: '改善ワークショップ',
  //   dayOffset: 3,
  //   hour: 14,
  //   durationHours: 2,
  //   category: 'user',
  // },
  // {
  //   id: 'event-wrap',
  //   title: '週次まとめ',
  //   dayOffset: 4,
  //   hour: 16,
  //   durationHours: 1,
  //   category: 'user',
  // },
  // {
  //   id: 'task-qa',
  //   title: '品質チェック',
  //   dayOffset: 0,
  //   hour: 10,
  //   minute: 30,
  //   durationHours: 1,
  //   durationMinutes: 30,
  //   category: 'task',
  // },
  // {
  //   id: 'task-training',
  //   title: '安全教育',
  //   dayOffset: 2,
  //   hour: 15,
  //   durationHours: 2,
  //   category: 'task',
  // },
  // {
  //   id: 'task-maint',
  //   title: '設備メンテ',
  //   dayOffset: 4,
  //   hour: 9,
  //   durationHours: 2,
  //   durationMinutes: 30,
  //   category: 'task',
  // },
];

