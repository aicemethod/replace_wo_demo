import { useEffect, useMemo, useState } from 'react';
import type { TimeEntryContext, TimeEntryModalMode } from '../../../types/timeEntry';
import type { ResourceSelection } from '../../../types/user';
import { TEST_USERS } from '../../../testdata/users';

export const ONE_HOUR_MS = 60 * 60 * 1000; // 1時間のミリ秒数

// ローカルテストデータ: リソース選択（デフォルトで最初の5人）
const DEFAULT_RESOURCE_IDS = TEST_USERS.slice(0, 5).map((user) => user.id);

export function getDefaultRange(ctx?: TimeEntryContext) {
  const now = new Date();
  now.setSeconds(0, 0); // 秒を0にリセット（分単位）

  // 「新しいタイムエントリを作成」ボタンの場合、現在時刻を開始、1時間後を終了にセット
  if (ctx?.source === 'button') {
    const start = ctx.start ? new Date(ctx.start) : now;
    start.setSeconds(0, 0);
    const end = new Date(start.getTime() + ONE_HOUR_MS);
    return { start, end };
  }

  // その他の場合（範囲選択、日付クリック、イベントクリックなど）
  const ctxStart = ctx?.start ? new Date(ctx.start) : undefined;
  const ctxEnd = ctx?.end ? new Date(ctx.end) : undefined;

  const start = ctxStart ?? now;
  const endCandidate = ctxEnd ?? new Date(start.getTime() + ONE_HOUR_MS);
  const end = endCandidate.getTime() <= start.getTime() ? new Date(start.getTime() + ONE_HOUR_MS) : endCandidate;
  return { start, end };
}

type UseTimeEntryModalProps = {
  open: boolean;
  context?: TimeEntryContext;
  mode?: TimeEntryModalMode;
  onDelete?: () => void;
  onDuplicate?: () => void;
};

export function useTimeEntryModal({
  open,
  context,
  mode = 'create',
  onDelete,
  onDuplicate,
}: UseTimeEntryModalProps) {
  const [resourceSelectionIds, setResourceSelectionIds] = useState<string[]>(DEFAULT_RESOURCE_IDS);
  const resourceSelections = useMemo(
    () =>
      TEST_USERS.filter((user) => resourceSelectionIds.includes(user.id)).map((user) => ({
        id: user.id,
        number: user.number,
        name: user.name,
      })),
    [resourceSelectionIds],
  );

  const [startDateTime, setStartDateTime] = useState(() => getDefaultRange().start);
  const [endDateTime, setEndDateTime] = useState(() => getDefaultRange().end);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedResources, setSelectedResources] = useState<ResourceSelection[]>(resourceSelections);

  useEffect(() => {
    setSelectedResources(resourceSelections);
  }, [resourceSelections]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // 編集モードまたは複製モードで、contextにstart/endがある場合はそれを使用
    // それ以外はデフォルト範囲を使用
    if ((mode === 'edit' || mode === 'duplicate') && context?.start) {
      const start = context.start ? new Date(context.start) : getDefaultRange(context).start;
      const end = context.end ? new Date(context.end) : getDefaultRange(context).end;
      setStartDateTime(start);
      setEndDateTime(end);
    } else {
      const { start, end } = getDefaultRange(context);
      setStartDateTime(start);
      setEndDateTime(end);
    }
  }, [open, context, mode]);

  const handleStartChange = (nextValue: Date) => {
    setStartDateTime(nextValue);
    setEndDateTime((prev) => {
      const syncedEnd = new Date(prev);
      syncedEnd.setFullYear(nextValue.getFullYear(), nextValue.getMonth(), nextValue.getDate());

      if (syncedEnd.getTime() <= nextValue.getTime()) {
        syncedEnd.setTime(nextValue.getTime() + ONE_HOUR_MS);
      }

      return syncedEnd;
    });
  };

  const handleEndChange = (nextValue: Date) => {
    setEndDateTime(nextValue);
    setStartDateTime((prev) => {
      const syncedStart = new Date(prev);
      syncedStart.setFullYear(nextValue.getFullYear(), nextValue.getMonth(), nextValue.getDate());

      if (nextValue.getTime() <= syncedStart.getTime()) {
        syncedStart.setTime(nextValue.getTime() - ONE_HOUR_MS);
      }

      return syncedStart;
    });
  };

  const resourceSummary = selectedResources
    .map((resource) => `${resource.number ?? ''} ${resource.name ?? ''}`.trim())
    .filter(Boolean)
    .join('\n');

  const handleResourceSave = (resources: ResourceSelection[]) => {
    setSelectedResources(resources);
    setResourceSelectionIds(resources.map((resource) => resource.id));
    setIsResourceModalOpen(false);
  };

  const handleResourceClick = () => {
    setIsResourceModalOpen(true);
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate();
    }
  };

  const handleDelete = () => {
    setIsDeleteConfirmModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteConfirmModalOpen(false);
    if (onDelete) {
      onDelete();
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmModalOpen(false);
  };

  const getHeaderTitle = () => {
    if (mode === 'edit') return 'タイムエントリを編集';
    if (mode === 'duplicate') return 'タイムエントリを複製';
    return '新しいタイムエントリを作成';
  };

  const getDescription = () => {
    if (mode === 'edit') return 'Time entry の基本情報を編集して編集を押してください。';
    if (mode === 'duplicate') return 'Time entry の基本情報を確認・編集して保存を押してください。';
    return 'Time entry の基本情報を入力して作成を押してください。';
  };

  return {
    startDateTime,
    endDateTime,
    isResourceModalOpen,
    setIsResourceModalOpen,
    isDeleteConfirmModalOpen,
    selectedResources,
    resourceSummary,
    handleStartChange,
    handleEndChange,
    handleResourceSave,
    handleResourceClick,
    handleDuplicate,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    getHeaderTitle,
    getDescription,
  };
}
