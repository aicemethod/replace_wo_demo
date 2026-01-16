import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaRegTrashAlt, FaTimes } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import UserSortingSelect from '../../../../components/component/UserSortingSelect';
import type { UserSortingOption } from '../../../../types/user';
import Button from '../../../../components/elements/Button';
import Checkbox from '../../../../components/elements/Checkbox';
import '../../TimeEntryModal/TimeEntryModal.css';
import './FavoriteTaskModal.css';

type FavoriteTask = {
  id: string;
  subcategory: string;
  taskName: string;
};

type FavoriteTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

const mockFavoriteTasks: FavoriteTask[] = [
  { id: 'fav-001', subcategory: '総務 / 申請', taskName: '備品申請確認' },
  { id: 'fav-002', subcategory: '経理 / 精算', taskName: '交通費精算チェック' },
  { id: 'fav-003', subcategory: '人事 / 教育', taskName: '研修資料作成' },
  { id: 'fav-004', subcategory: '情シス / 保守', taskName: 'アカウント棚卸' },
  { id: 'fav-005', subcategory: '品質 / 改善', taskName: '不具合報告レビュー' },
];

function FavoriteTaskModal({ open, onClose }: FavoriteTaskModalProps) {
  const [categoryKeyword, setCategoryKeyword] = useState('');
  const [taskKeyword, setTaskKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<FavoriteTask[]>(mockFavoriteTasks);
  const [selectedTasks, setSelectedTasks] = useState<FavoriteTask[]>([]);
  const [checkedResults, setCheckedResults] = useState<string[]>([]);
  const [checkedSelected, setCheckedSelected] = useState<string[]>([]);
  const [isLeftHeaderChecked, setIsLeftHeaderChecked] = useState(false);
  const [isRightHeaderChecked, setIsRightHeaderChecked] = useState(false);

const sortingOptions: UserSortingOption[] = [
  { value: 'recent', label: '最近更新順' },
  { value: 'alphabet', label: '名前順' },
  { value: 'department', label: '部署順' },
];

  const [searchSortValue, setSearchSortValue] = useState(
    sortingOptions[0]?.value ?? 'recent',
  );
  const [favoriteSortValue, setFavoriteSortValue] = useState(
    sortingOptions[0]?.value ?? 'recent',
  );

  const filteredResults = useMemo(() => {
    return searchResults.filter(
      (task) =>
        (!categoryKeyword || task.subcategory.includes(categoryKeyword)) &&
        (!taskKeyword || task.taskName.includes(taskKeyword)),
    );
  }, [categoryKeyword, taskKeyword, searchResults]);

  const availableResults = useMemo(
    () => filteredResults.filter((task) => !selectedTasks.some((selected) => selected.id === task.id)),
    [filteredResults, selectedTasks],
  );

  const sortTasks = useCallback(
    (tasks: FavoriteTask[], sortValue: string) => {
      const list = [...tasks];
      if (sortValue === 'alphabet') {
        return list.sort((a, b) => a.taskName.localeCompare(b.taskName, 'ja'));
      }
      if (sortValue === 'department') {
        return list.sort((a, b) => a.subcategory.localeCompare(b.subcategory, 'ja'));
      }
      return list;
    },
    [],
  );

  const sortedAvailableResults = useMemo(
    () => sortTasks(availableResults, searchSortValue),
    [availableResults, searchSortValue, sortTasks],
  );

  const sortedSelectedTasks = useMemo(
    () => sortTasks(selectedTasks, favoriteSortValue),
    [favoriteSortValue, selectedTasks, sortTasks],
  );

  const handleSearch = useCallback(() => {
    if (!categoryKeyword && !taskKeyword) {
      setSearchResults(mockFavoriteTasks);
      return;
    }
    setSearchResults(
      mockFavoriteTasks.filter(
        (task) =>
          (!categoryKeyword || task.subcategory.includes(categoryKeyword)) &&
          (!taskKeyword || task.taskName.includes(taskKeyword)),
      ),
    );
  }, [categoryKeyword, taskKeyword]);

  const handleClear = useCallback(() => {
    setCategoryKeyword('');
    setTaskKeyword('');
    setSearchResults(mockFavoriteTasks);
    setCheckedResults([]);
    setIsLeftHeaderChecked(false);
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setCheckedResults((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  const toggleSelectedCheck = useCallback((id: string) => {
    setCheckedSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  const toggleLeftHeaderCheck = useCallback(() => {
    const nextChecked = !isLeftHeaderChecked;
    setIsLeftHeaderChecked(nextChecked);
    setCheckedResults(nextChecked ? availableResults.map((task) => task.id) : []);
  }, [availableResults, isLeftHeaderChecked]);

  const toggleRightHeaderCheck = useCallback(() => {
    const newState = checkedSelected.length < selectedTasks.length;
    setIsRightHeaderChecked(newState);
    setCheckedSelected(newState ? selectedTasks.map((task) => task.id) : []);
  }, [checkedSelected.length, selectedTasks]);

  const moveToSelected = useCallback(() => {
    const toAdd = availableResults.filter((task) => checkedResults.includes(task.id));
    setSelectedTasks((prev) => [...prev, ...toAdd]);
    setCheckedResults([]);
    setIsLeftHeaderChecked(false);
  }, [availableResults, checkedResults]);

  const removeCheckedSelected = useCallback(() => {
    setSelectedTasks((prev) => prev.filter((task) => !checkedSelected.includes(task.id)));
    setCheckedSelected([]);
    setIsRightHeaderChecked(false);
  }, [checkedSelected]);

  const removeTask = useCallback((id: string) => {
    setSelectedTasks((prev) => prev.filter((task) => task.id !== id));
    setCheckedSelected((prev) => prev.filter((value) => value !== id));
  }, []);

  const resetModal = useCallback(() => {
    setCategoryKeyword('');
    setTaskKeyword('');
    setSearchResults(mockFavoriteTasks);
    setSelectedTasks([]);
    setCheckedResults([]);
    setCheckedSelected([]);
    setIsLeftHeaderChecked(false);
    setIsRightHeaderChecked(false);
    setSearchSortValue(sortingOptions[0]?.value ?? 'recent');
    setFavoriteSortValue(sortingOptions[0]?.value ?? 'recent');
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [onClose, resetModal]);

  const handleSave = useCallback(() => {
    // 保存先が未定のためクローズのみ
    resetModal();
    onClose();
  }, [onClose, resetModal]);

  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open, resetModal]);

  return (
    <div className={`time-entry-modal ${open ? 'open' : 'closed'}`} role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="time-entry-modal-backdrop" onClick={handleClose} aria-hidden="true" />
      <div className="time-entry-modal-panel favorite-task-modal-panel">
        <header className="time-entry-modal-header">
          <div className="favorite-task-header-left">
            <p className="modal-label">お気に入り間接タスク</p>
          </div>
        </header>

        <div className="time-entry-modal-body favorite-task-modal-body">
          <p className="modal-description">よく利用する間接タスクを設定して、素早く選択できるようにします。</p>

          <div className="modal-grid">
            <div className="grid-left">
              <label className="modal-label" htmlFor="favorite-category">
                サブカテゴリ
              </label>
              <input
                id="favorite-category"
                type="text"
                className="input-field"
                value={categoryKeyword}
                onChange={(event) => setCategoryKeyword(event.target.value)}
                placeholder="例: 総務 / 申請"
              />
              <div className="right-align">
                <Button variant="static" color="secondary" onClick={handleClear}>
                  クリア
                </Button>
              </div>
            </div>

            <div className="grid-right">
              <label className="modal-label" htmlFor="favorite-task-name">
                タスク名
              </label>
              <input
                id="favorite-task-name"
                type="text"
                className="input-field"
                value={taskKeyword}
                onChange={(event) => setTaskKeyword(event.target.value)}
                placeholder="例: 備品申請確認"
              />
              <div className="left-align">
                <Button variant="static" color="secondary" onClick={handleSearch}>
                  検索
                </Button>
              </div>
            </div>
          </div>

          <hr className="divider" />
          <p className="list-description">検索結果からお気に入り一覧に追加してください。</p>

          <div className="task-grid">
            <div className="task-list">
              <div className="list-header">
                <span className="modal-label">検索結果</span>
                <span className="count">{availableResults.length}件</span>
              </div>
              <div className="list-subheader">
                <div className="list-subheader-left">
                  <Checkbox
                    checked={isLeftHeaderChecked}
                    onChange={toggleLeftHeaderCheck}
                    className="subheader-checkbox"
                  />
                  <div className="favorite-task-sorting-select">
                    <UserSortingSelect
                      value={searchSortValue}
                      options={sortingOptions}
                      onChange={setSearchSortValue}
                    />
                  </div>
                </div>
              </div>
              <div className={`list-box ${availableResults.length === 0 ? 'empty' : ''}`}>
                {sortedAvailableResults.map((task) => (
                  <label key={task.id} className="list-item-2line">
                    <Checkbox
                      checked={checkedResults.includes(task.id)}
                      onChange={() => toggleCheck(task.id)}
                    />
                    <div className="list-text">
                      <div className="category-name">{task.subcategory}</div>
                      <div className="task-name">{task.taskName}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="move-button-container">
              <Button variant="static" color="secondary" onClick={moveToSelected} aria-label="右へ追加">
                <IoIosArrowForward />
              </Button>
            </div>

            <div className="task-list">
              <div className="list-header">
                <span className="modal-label">お気に入り</span>
                <div className="list-header-actions">
                  <Button
                    variant="static"
                    color="secondary"
                    onClick={removeCheckedSelected}
                    aria-label="選択したタスクを削除"
                    disabled={selectedTasks.length === 0}
                  >
                    <FaRegTrashAlt />
                  </Button>
                  <span className="count">{selectedTasks.length}件</span>
                </div>
              </div>
              <div className="list-subheader">
                <div className="list-subheader-left">
                  <Checkbox
                    checked={isRightHeaderChecked}
                    onChange={toggleRightHeaderCheck}
                    className="subheader-checkbox"
                  />
                  <div className="favorite-task-sorting-select">
                    <UserSortingSelect
                      value={favoriteSortValue}
                      options={sortingOptions}
                      onChange={setFavoriteSortValue}
                    />
                  </div>
                </div>
              </div>
              <div className={`list-box ${selectedTasks.length === 0 ? 'empty' : ''}`}>
                {sortedSelectedTasks.map((task) => (
                  <div key={task.id} className="list-item-favorite">
                    <div className="list-item-favorite-left">
                      <Checkbox
                        checked={checkedSelected.includes(task.id)}
                        onChange={() => toggleSelectedCheck(task.id)}
                      />
                      <div className="list-text">
                        <div className="category-name">{task.subcategory}</div>
                        <div className="task-name">{task.taskName}</div>
                      </div>
                    </div>
                    <Button
                      variant="static"
                      color="secondary"
                      aria-label={`${task.taskName} を削除`}
                      onClick={() => removeTask(task.id)}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="time-entry-modal-footer">
          <Button variant="static" color="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          <Button variant="static" color="primary" onClick={handleSave}>
            保存
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default FavoriteTaskModal;

