import UserSortingSelect from '../../../components/component/UserSortingSelect';
import Checkbox from '../../../components/elements/Checkbox';
import RadioButton from '../../../components/elements/RadioButton';
import { useSidebar, sortOptions, mockTasks } from './useSidebar';
import './Sidebar.css';

type SidebarProps = {
  viewMode: 'user' | 'task';
};

function Sidebar({ viewMode }: SidebarProps) {
  const {
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
  } = useSidebar();

  return (
    <aside className="sidebar">
      {viewMode === 'user' ? (
        <div className="sidebar-panel">
          <div className="sidebar-section">
            <label className="sidebar-section-label" htmlFor="sidebar-search-input">
              検索
            </label>
            <RadioButton
              name="sidebar-search-type"
              options={[
                { value: 'username', label: 'ユーザー名' },
                { value: 'employeeId', label: '社員番号' },
              ]}
              value={searchType}
              onChange={(value) => setSearchType(value as 'username' | 'employeeId')}
            />
            <input
              id="sidebar-search-input"
              className="sidebar-text-input"
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <label className="sidebar-checkbox-option" htmlFor="sidebar-checkbox-self">
              <Checkbox
                id="sidebar-checkbox-self"
                checked={resourceSelectionIds.includes('self')}
                onChange={() => toggleUserSelection('self')}
              />
              <span className="sidebar-checkbox-text-lines">
                <span className="sidebar-entry-primary">社員番号（自分）</span>
                <span className="sidebar-entry-secondary">ユーザー名</span>
              </span>
            </label>
          </div>

          <div className="sidebar-section">
            <UserSortingSelect value={sortValue} options={sortOptions} onChange={setSortValue} />
          </div>

          <ul className="sidebar-list">
            {filteredUsers.length === 0 ? (
              <li className="sidebar-entry">
                <p className="sidebar-entry-secondary">ユーザー一覧設定でユーザーを登録してください。</p>
              </li>
            ) : (
              filteredUsers.map((user) => (
                <li key={user.id}>
                  <label className="sidebar-entry sidebar-entry-checkbox">
                    <Checkbox
                      checked={resourceSelectionIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="sidebar-checkbox"
                    />
                    <div className="sidebar-entry-text">
                      <p className="sidebar-entry-primary sidebar-entry-primary-small">{user.number}</p>
                      <p className="sidebar-entry-secondary">{user.name}</p>
                    </div>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <div className="sidebar-panel">
          <div className="sidebar-section">
            <UserSortingSelect value={sortValue} options={sortOptions} onChange={setSortValue} />
          </div>
          <ul className="sidebar-task-list">
            {mockTasks.map((task) => (
              <li key={task.id}>
                <label
                  className="sidebar-entry sidebar-entry-radio"
                  onClick={(event) => handleTaskLabelClick(task.id, event)}
                >
                  <input
                    className="sidebar-radio-input"
                    type="radio"
                    name="task"
                    value={task.id}
                    checked={selectedTask === task.id}
                    onChange={() => handleTaskChange(task.id)}
                    onClick={(event) => handleTaskClick(task.id, event)}
                  />
                  <div className="sidebar-entry-text">
                    <p className="sidebar-entry-primary">{task.subCategory}</p>
                    <p className="sidebar-entry-secondary">{task.name}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;

