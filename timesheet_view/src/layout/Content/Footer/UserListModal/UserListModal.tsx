import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaRegTrashAlt, FaTimes } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import UserSortingSelect from '../../../../components/component/UserSortingSelect';
import type { UserSortingOption } from '../../../../types/user';
import type { TestUser } from '../../../../testdata/users';
import { TEST_USERS } from '../../../../testdata/users';
import Button from '../../../../components/elements/Button';
import Checkbox from '../../../../components/elements/Checkbox';
import '../../TimeEntryModal/TimeEntryModal.css';
import './UserListModal.css';

type UserListModalProps = {
  open: boolean;
  onClose: () => void;
};

const sortingOptions: UserSortingOption[] = [
  { value: 'recent', label: '最近更新順' },
  { value: 'alphabet', label: '名前順' },
  { value: 'department', label: '部署順' },
];

// ローカルテストデータ: 選択済みユーザーID（デフォルトで最初の5人）
const DEFAULT_SELECTED_IDS = TEST_USERS.slice(0, 5).map((user) => user.id);

function UserListModal({ open, onClose }: UserListModalProps) {
  const allUsers = TEST_USERS;
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(DEFAULT_SELECTED_IDS);
  const selectedUsers = useMemo(
    () => TEST_USERS.filter((user) => selectedUserIds.includes(user.id)),
    [selectedUserIds],
  );

  const [employeeId, setEmployeeId] = useState('');
  const [userName, setUserName] = useState('');
  const [searchResults, setSearchResults] = useState<TestUser[]>(allUsers);
  const [localSelectedUsers, setLocalSelectedUsers] = useState<TestUser[]>(selectedUsers);
  const [checkedResults, setCheckedResults] = useState<string[]>([]);
  const [checkedSelected, setCheckedSelected] = useState<string[]>([]);
  const [isLeftHeaderChecked, setIsLeftHeaderChecked] = useState(false);
  const [isRightHeaderChecked, setIsRightHeaderChecked] = useState(false);
  const [searchSortValue, setSearchSortValue] = useState(
    sortingOptions[0]?.value ?? 'recent',
  );
  const [sortValue, setSortValue] = useState(
    sortingOptions[0]?.value ?? 'recent',
  );

  useEffect(() => {
    setSearchResults(allUsers);
  }, [allUsers]);

  useEffect(() => {
    if (open) {
      setLocalSelectedUsers(selectedUsers);
      setSearchResults(allUsers);
    }
  }, [open, selectedUsers, allUsers]);

  const filteredResults = useMemo(() => {
    if (!employeeId && !userName) {
      return searchResults;
    }
    return searchResults.filter(
      (resource) =>
        (!employeeId || resource.number?.includes(employeeId)) &&
        (!userName || resource.name?.includes(userName)),
    );
  }, [employeeId, userName, searchResults]);

  const availableResults = useMemo(
    () => filteredResults.filter((resource) => !localSelectedUsers.some((selected) => selected.id === resource.id)),
    [filteredResults, localSelectedUsers],
  );

  const sortedAvailableResults = useMemo(() => {
    const list = [...availableResults];
    if (searchSortValue === 'alphabet') {
      return list.sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'ja'),
      );
    }
    if (searchSortValue === 'department') {
      return list.sort((a, b) =>
        (a.number ?? '').localeCompare(b.number ?? '', 'ja'),
      );
    }
    return list;
  }, [availableResults, searchSortValue]);

  const handleSearch = useCallback(() => {
    if (!employeeId && !userName) {
      setSearchResults(allUsers);
      return;
    }
    setSearchResults(
      allUsers.filter(
        (resource) =>
          (!employeeId || resource.number?.includes(employeeId)) &&
          (!userName || resource.name?.includes(userName)),
      ),
    );
  }, [allUsers, employeeId, userName]);

  const handleClear = useCallback(() => {
    setEmployeeId('');
    setUserName('');
    setSearchResults(allUsers);
    setCheckedResults([]);
    setIsLeftHeaderChecked(false);
  }, [allUsers]);

  const toggleCheck = useCallback((id: string) => {
    setCheckedResults((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  const toggleSelectedCheck = useCallback((id: string) => {
    setCheckedSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  }, []);

  const toggleLeftHeaderCheck = useCallback(() => {
    const nextChecked = !isLeftHeaderChecked;
    setIsLeftHeaderChecked(nextChecked);
    setCheckedResults(nextChecked ? availableResults.map((resource) => resource.id) : []);
  }, [isLeftHeaderChecked, availableResults]);

  const toggleRightHeaderCheck = useCallback(() => {
    const newState = checkedSelected.length < localSelectedUsers.length;
    setIsRightHeaderChecked(newState);
    setCheckedSelected(newState ? localSelectedUsers.map((resource) => resource.id) : []);
  }, [checkedSelected.length, localSelectedUsers]);

  const moveToSelected = useCallback(() => {
    const toAdd = availableResults.filter((resource) => checkedResults.includes(resource.id));
    setLocalSelectedUsers((prev) => [...prev, ...toAdd]);
    setCheckedResults([]);
    setIsLeftHeaderChecked(false);
  }, [availableResults, checkedResults]);

  const removeCheckedSelected = useCallback(() => {
    setLocalSelectedUsers((prev) => prev.filter((resource) => !checkedSelected.includes(resource.id)));
    setCheckedSelected([]);
    setIsRightHeaderChecked(false);
  }, [checkedSelected]);

  const removeUser = useCallback((id: string) => {
    setLocalSelectedUsers((prev) => prev.filter((resource) => resource.id !== id));
    setCheckedSelected((prev) => prev.filter((value) => value !== id));
  }, []);

  const sortedSelectedUsers = useMemo(() => {
    const list = [...localSelectedUsers];
    if (sortValue === 'alphabet') {
      return list.sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '', 'ja'),
      );
    }
    if (sortValue === 'department') {
      return list.sort((a, b) =>
        (a.number ?? '').localeCompare(b.number ?? '', 'ja'),
      );
    }
    return list;
  }, [localSelectedUsers, sortValue]);

  const resetModal = useCallback(() => {
    setEmployeeId('');
    setUserName('');
    setSearchResults(allUsers);
    setLocalSelectedUsers(selectedUsers);
    setCheckedResults([]);
    setCheckedSelected([]);
    setIsLeftHeaderChecked(false);
    setIsRightHeaderChecked(false);
    setSearchSortValue(sortingOptions[0]?.value ?? 'recent');
    setSortValue(sortingOptions[0]?.value ?? 'recent');
  }, [allUsers, selectedUsers]);

  const handleSave = useCallback(() => {
    setSelectedUserIds(localSelectedUsers.map((resource) => resource.id));
    resetModal();
    onClose();
  }, [onClose, resetModal, localSelectedUsers]);

  const handleClose = useCallback(() => {
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
      <div className="time-entry-modal-panel user-list-modal-panel">
        <header className="time-entry-modal-header">
          <div className="user-list-header-left">
            <p className="modal-label">ユーザー一覧設定</p>
          </div>
        </header>

        <div className="time-entry-modal-body">
          <p className="modal-description">Dataverse で参照できるユーザーを検索して選択できます。</p>
          <div className="modal-grid">
            <div className="grid-left">
              <label className="modal-label" htmlFor="employee-id">
                社員番号
              </label>
              <input
                id="employee-id"
                type="text"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                className="input-field"
                placeholder="例: EMP-001"
              />
              <div className="right-align">
                <Button variant="static" color="secondary" onClick={handleClear}>
                  クリア
                </Button>
              </div>
            </div>
            <div className="grid-right">
              <label className="modal-label" htmlFor="user-name">
                ユーザー名
              </label>
              <input
                id="user-name"
                type="text"
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                className="input-field"
                placeholder="例: 田中"
              />
              <div className="left-align">
                <Button variant="static" color="secondary" onClick={handleSearch}>
                  検索
                </Button>
              </div>
            </div>
          </div>

          <hr className="divider" />
          <p className="list-description">検索結果から設定済ユーザーへ追加・削除できます。</p>

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
                  <div className="user-list-sorting-select">
                    <UserSortingSelect
                      value={searchSortValue}
                      options={sortingOptions}
                      onChange={setSearchSortValue}
                    />
                  </div>
                </div>
              </div>
              <div className={`list-box ${availableResults.length === 0 ? 'empty' : ''}`}>
                {sortedAvailableResults.map((resource) => (
                  <label key={resource.id} className="list-item-2line">
                    <Checkbox
                      checked={checkedResults.includes(resource.id)}
                      onChange={() => toggleCheck(resource.id)}
                    />
                    <div className="list-text">
                      <div className="category-name">{resource.number ?? '-'}</div>
                      <div className="task-name">{resource.name ?? '名称未設定'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="move-button-container">
              <Button variant="static" color="secondary" onClick={moveToSelected} aria-label="右に移動">
                <IoIosArrowForward />
              </Button>
            </div>

            <div className="task-list">
              <div className="list-header">
                <span className="modal-label">設定済ユーザー</span>
                <div className="list-header-actions">
                  <Button
                    variant="static"
                    color="secondary"
                    onClick={removeCheckedSelected}
                    aria-label="選択したユーザーを削除"
                    disabled={localSelectedUsers.length === 0}
                  >
                    <FaRegTrashAlt />
                  </Button>
                  <span className="count">{localSelectedUsers.length}件</span>
                </div>
              </div>
              <div className="list-subheader">
                <div className="list-subheader-left">
                  <Checkbox
                    checked={isRightHeaderChecked}
                    onChange={toggleRightHeaderCheck}
                    className="subheader-checkbox"
                  />
                  <div className="user-list-sorting-select">
                    <UserSortingSelect
                      value={sortValue}
                      options={sortingOptions}
                      onChange={setSortValue}
                    />
                  </div>
                </div>
              </div>
              <div className={`list-box ${localSelectedUsers.length === 0 ? 'empty' : ''}`}>
                {sortedSelectedUsers.map((resource) => (
                  <div key={resource.id} className="list-item-favorite">
                    <div className="list-item-favorite-left">
                      <Checkbox
                        checked={checkedSelected.includes(resource.id)}
                        onChange={() => toggleSelectedCheck(resource.id)}
                      />
                      <div className="list-text">
                        <div className="category-name">{resource.number ?? '-'}</div>
                        <div className="task-name">{resource.name ?? '名称未設定'}</div>
                      </div>
                    </div>
                    <Button
                      variant="static"
                      color="secondary"
                      aria-label={`${resource.name ?? 'ユーザー'}を削除`}
                      onClick={() => removeUser(resource.id)}
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

export default UserListModal;

