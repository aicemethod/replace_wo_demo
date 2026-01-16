// タイムエントリ関連の型定義

export type TimeEntryContext = {
  start?: Date;
  end?: Date;
  title?: string;
  source?: 'button' | 'date' | 'range' | 'event';
  eventId?: string;
};

export type TimeEntryModalMode = 'create' | 'edit' | 'duplicate';

