import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { TEST_USERS } from '../../../testdata/users';

export const sortOptions = [
  { value: 'recent', label: '最近更新順' },
  { value: 'alphabet', label: '名前順' },
  { value: 'department', label: '部署順' },
];

export const mockTasks = [
  { id: 't-001', subCategory: '総務 / 申請', name: '備品申請確認' },
  { id: 't-002', subCategory: '経理 / 精算', name: '交通費精算チェック' },
  { id: 't-003', subCategory: '人事 / 教育', name: '研修資料作成' },
  { id: 't-004', subCategory: '情シス / 保守', name: 'アカウント棚卸' },
];

// ローカルテストデータ: 選択済みユーザーID（デフォルトで最初の5人）
const DEFAULT_SELECTED_IDS = TEST_USERS.slice(0, 5).map((user) => user.id);

export function useSidebar() {
  const [selectedUserIds] = useState<string[]>(DEFAULT_SELECTED_IDS);
  const [resourceSelectionIds, setResourceSelectionIds] = useState<string[]>(DEFAULT_SELECTED_IDS);
  const [searchType, setSearchType] = useState<'username' | 'employeeId'>('username');
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState(sortOptions[0]?.value ?? 'recent');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const linkedUsers = useMemo(
    () => TEST_USERS.filter((user) => selectedUserIds.includes(user.id)),
    [selectedUserIds],
  );

  const searchPlaceholder =
    searchType === 'username' ? 'ユーザー名を入力' : '社員番号を入力';

  const toggleUserSelection = (userId: string) => {
    setResourceSelectionIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleTaskChange = (taskId: string) => {
    setSelectedTask(taskId);
  };

  const handleTaskClick = (taskId: string, event: MouseEvent<HTMLInputElement>) => {
    if (selectedTask === taskId) {
      event.preventDefault();
      setSelectedTask(null);
    }
  };

  const handleTaskLabelClick = (taskId: string, event: MouseEvent<HTMLLabelElement>) => {
    if (selectedTask === taskId) {
      event.preventDefault();
      setSelectedTask(null);
    }
  };

  const filteredUsers = useMemo(() => {
    let list = linkedUsers.filter((user) => user.id !== 'self');
    if (searchValue.trim()) {
      const keyword = searchValue.trim();
      list =
        searchType === 'username'
          ? list.filter((user) => user.name.includes(keyword))
          : list.filter((user) => user.number?.includes(keyword));
    }

    if (sortValue === 'alphabet') {
      list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'ja'));
    } else if (sortValue === 'department') {
      list = [...list].sort((a, b) => (a.number ?? '').localeCompare(b.number ?? '', 'ja'));
    }
    return list;
  }, [linkedUsers, searchType, searchValue, sortValue]);

  return {
    resourceSelectionIds,
    searchType,
    setSearchType,
    searchValue,
    setSearchValue,
    sortValue,
    setSortValue,
    selectedTask,
    searchPlaceholder,
    filteredUsers,
    toggleUserSelection,
    handleTaskChange,
    handleTaskClick,
    handleTaskLabelClick,
  };
}
