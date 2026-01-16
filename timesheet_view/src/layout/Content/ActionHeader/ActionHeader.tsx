import TabButton from '../../../components/elements/TabButton';
import CreateEntryButton from '../../../components/component/CreateEntryButton';
import TodayButton from '../../../components/component/TodayButton';
import NavigationButton from '../../../components/component/NavigationButton';
import DatePickerControl from '../../../components/component/DatePickerControl';
import './ActionHeader.css';

type ActionHeaderProps = {
  viewMode: 'user' | 'task';
  onViewModeChange: (mode: 'user' | 'task') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  dateView: 'day' | '3day' | 'week';
  onDateViewChange: (view: 'day' | '3day' | 'week') => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateEntry: () => void;
};

function ActionHeader({
  viewMode,
  onViewModeChange,
  currentDate,
  onDateChange,
  dateView,
  onDateViewChange,
  onPrev,
  onNext,
  onToday,
  onCreateEntry,
}: ActionHeaderProps) {
  const viewModeOptions = [
    { value: 'user', label: 'ユーザー一覧設定' },
    { value: 'task', label: '間接タスク' },
  ];

  const dateViewOptions = [
    { value: 'day', label: '1日' },
    { value: '3day', label: '3日' },
    { value: 'week', label: '週' },
  ];

  return (
    <header className="action-header">
      <div className="action-header-left">
        <TabButton
          options={viewModeOptions}
          value={viewMode}
          onChange={(value) => onViewModeChange(value as 'user' | 'task')}
        />
        <CreateEntryButton onClick={onCreateEntry} />
      </div>
      <div className="action-header-right">
        <TodayButton onClick={onToday} />
        <NavigationButton direction="prev" onClick={onPrev} />
        <NavigationButton direction="next" onClick={onNext} />
        <DatePickerControl selectedDate={currentDate} onChange={onDateChange} />
        <TabButton
          options={dateViewOptions}
          value={dateView}
          onChange={(value) => onDateViewChange(value as 'day' | '3day' | 'week')}
        />
      </div>
    </header>
  );
}

export default ActionHeader;


