import { useCallback, useEffect, useMemo, useState } from 'react';
import { TEST_USERS } from '../../../../../testdata/users';
import type { ResourceSelection } from '../../../../../types/user';

// ローカルテストデータ: 選択済みユーザーID（デフォルトで最初の5人）
const DEFAULT_SELECTED_IDS = TEST_USERS.slice(0, 5).map((user) => user.id);
export const linkedUsers = TEST_USERS.filter((user) => DEFAULT_SELECTED_IDS.includes(user.id));

type UseResourceSelectModalProps = {
  open: boolean;
  selectedResources?: ResourceSelection[];
  onSave: (resources: ResourceSelection[]) => void;
  onClose: () => void;
};

export function useResourceSelectModal({
  open,
  selectedResources = [],
  onSave,
  onClose,
}: UseResourceSelectModalProps) {
  const [searchType, setSearchType] = useState<'name' | 'number'>('name');
  const [keyword, setKeyword] = useState('');
  const [sortByNumberAsc, setSortByNumberAsc] = useState(true);
  const [sortByNameAsc, setSortByNameAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const selectableIds = selectedResources
        .map((resource) => resource.id)
        .filter((id) => linkedUsers.some((user) => user.id === id));
      setSelectedIds(selectableIds);
    }
  }, [open, selectedResources]);

  const filteredResources = useMemo(() => {
    const normalizedKeyword = keyword.trim();
    const baseList = linkedUsers;
    if (!normalizedKeyword) {
      return baseList;
    }

    if (searchType === 'number') {
      return baseList.filter((resource) => resource.number?.includes(normalizedKeyword));
    }
    return baseList.filter((resource) => resource.name?.includes(normalizedKeyword));
  }, [keyword, searchType]);

  const sortedResources = useMemo(() => {
    const pinnedResource = filteredResources.find((resource) => resource.id === 'self');
    const sortableList = filteredResources.filter((resource) => resource.id !== 'self');

    sortableList.sort((a, b) => {
      if (searchType === 'number') {
        const numberCompare = sortByNumberAsc
          ? (a.number ?? '').localeCompare(b.number ?? '')
          : (b.number ?? '').localeCompare(a.number ?? '');

        if (numberCompare !== 0) {
          return numberCompare;
        }
      }

      const nameCompare = sortByNameAsc
        ? (a.name ?? '').localeCompare(b.name ?? '', 'ja')
        : (b.name ?? '').localeCompare(a.name ?? '', 'ja');

      if (nameCompare !== 0) {
        return nameCompare;
      }

      return (a.id ?? '').localeCompare(b.id ?? '');
    });

    return pinnedResource ? [pinnedResource, ...sortableList] : sortableList;
  }, [filteredResources, searchType, sortByNameAsc, sortByNumberAsc]);

  const pinnedResource = useMemo(
    () => sortedResources.find((resource) => resource.id === 'self'),
    [sortedResources],
  );
  const scrollableResources = useMemo(
    () => sortedResources.filter((resource) => resource.id !== 'self'),
    [sortedResources],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  const resetFilters = useCallback(() => {
    setKeyword('');
    setSearchType('name');
    setSortByNameAsc(true);
    setSortByNumberAsc(true);
  }, []);

  const handleClose = useCallback(() => {
    resetFilters();
    onClose();
  }, [onClose, resetFilters]);

  const handleSave = useCallback(() => {
    const selectedList = linkedUsers.filter((resource) => selectedIds.includes(resource.id));
    onSave(selectedList);
    resetFilters();
  }, [onSave, resetFilters, selectedIds]);

  const toggleSortByNumber = useCallback(() => {
    setSortByNumberAsc((prev) => !prev);
  }, []);

  const toggleSortByName = useCallback(() => {
    setSortByNameAsc((prev) => !prev);
  }, []);

  const searchPlaceholder = searchType === 'name' ? 'ユーザー名で検索' : '社員番号で検索';

  return {
    searchType,
    setSearchType,
    keyword,
    setKeyword,
    sortByNumberAsc,
    sortByNameAsc,
    selectedIds,
    pinnedResource,
    scrollableResources,
    searchPlaceholder,
    toggleSelect,
    toggleSortByNumber,
    toggleSortByName,
    handleClose,
    handleSave,
  };
}
