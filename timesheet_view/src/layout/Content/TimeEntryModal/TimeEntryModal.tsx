import './TimeEntryModal.css';
import { WORK_ORDER_OPTIONS } from '../../../constants/workOrders';
import TimeEntryDateTimeField from './fields/TimeEntryDateTimeField';
import TimeEntrySelectField, { type TimeEntrySelectOption } from './fields/TimeEntrySelectField';
import TimeEntryTextareaField from './fields/TimeEntryTextareaField';
import TimeEntryWOSelect from './fields/TimeEntryWOSelect';
import ResourceSelectModal from './modals/ResourceSelectModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import Button from '../../../components/elements/Button';
import Modal from '../../../components/elements/Modal';
import type { TimeEntryContext, TimeEntryModalMode } from '../../../types/timeEntry';
import { useTimeEntryModal } from './useTimeEntryModal';

type TimeEntryModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  context?: TimeEntryContext;
  mode?: TimeEntryModalMode;
};

const endUserOptions: TimeEntrySelectOption[] = [
  { value: 'user-a', label: 'User A' },
  { value: 'user-b', label: 'User B' },
];

const locationOptions: TimeEntrySelectOption[] = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'osaka', label: 'Osaka' },
];

const timeCategoryOptions: TimeEntrySelectOption[] = [
  { value: 'standard', label: '標準' },
  { value: 'overtime', label: '残業' },
];

const categoryOptions: TimeEntrySelectOption[] = [
  { value: 'production', label: '生産' },
  { value: 'support', label: 'サポート' },
];

const paymentOptions: TimeEntrySelectOption[] = [
  { value: 'hourly', label: '時間給' },
  { value: 'daily', label: '日給' },
];

const mainCategoryOptions: TimeEntrySelectOption[] = [
  { value: 'maintenance', label: '保全' },
  { value: 'development', label: '開発' },
];

const subCategoryOptions: TimeEntrySelectOption[] = [
  { value: 'line-a', label: 'ラインA' },
  { value: 'line-b', label: 'ラインB' },
];

const taskOptions: TimeEntrySelectOption[] = [
  { value: 'inspection', label: '点検' },
  { value: 'report', label: '報告' },
];

function TimeEntryModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  onDuplicate,
  context,
  mode = 'create',
}: TimeEntryModalProps) {
  const {
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
  } = useTimeEntryModal({
    open,
    context,
    mode,
    onDelete,
    onDuplicate,
  });

  const renderFooter = () => {
    if (mode === 'edit') {
      return (
        <footer className="time-entry-modal-footer">
          <Button variant="static" color="secondary" onClick={handleDelete} style={{ marginRight: 'auto' }}>
            削除
          </Button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="static" color="secondary" onClick={onClose}>
              キャンセル
            </Button>
            <Button variant="static" color="secondary" onClick={handleDuplicate}>
              複製
            </Button>
            <Button variant="static" color="primary" onClick={onSubmit}>
              編集
            </Button>
          </div>
        </footer>
      );
    }

    if (mode === 'duplicate') {
      return (
        <footer className="time-entry-modal-footer">
          <Button variant="static" color="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="static" color="primary" onClick={onSubmit}>
            保存
          </Button>
        </footer>
      );
    }

    // create mode
    return (
      <footer className="time-entry-modal-footer">
        <Button variant="static" color="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button variant="static" color="primary" onClick={onSubmit}>
          作成
        </Button>
      </footer>
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={getHeaderTitle()}
        footer={renderFooter()}
      >
        <p className="time-entry-modal-description">{getDescription()}</p>
        <label className="time-entry-field-label">WO番号</label>
        <TimeEntryWOSelect options={WORK_ORDER_OPTIONS} placeholder="WO番号を選択" />

        <div className="time-entry-grid">
          <div className="time-entry-column">
            <TimeEntryDateTimeField label="スケジュール開始日" value={startDateTime} onChange={handleStartChange} />
            <TimeEntryDateTimeField label="スケジュール終了日" value={endDateTime} onChange={handleEndChange} />
            <TimeEntrySelectField label="EndUser" options={endUserOptions} placeholder="EndUser を選択" />
            <TimeEntrySelectField label="Location" options={locationOptions} placeholder="Location を選択" />
            <TimeEntryTextareaField
              label="リソース"
              placeholder="リソースを選択してください"
              rows={3}
              value={resourceSummary || undefined}
              readOnly
              onClick={handleResourceClick}
              rightSlot={
                <Button variant="static" color="secondary" onClick={handleResourceClick} className="time-entry-link">
                  リソース選択
                </Button>
              }
            />
          </div>
          <div className="time-entry-column">
            <TimeEntrySelectField
              label="タイムカテゴリ"
              options={timeCategoryOptions}
              placeholder="タイムカテゴリを選択"
            />
            <TimeEntrySelectField label="カテゴリ" options={categoryOptions} placeholder="カテゴリを選択" />
            <TimeEntrySelectField
              label="ペイメントタイプ"
              options={paymentOptions}
              placeholder="ペイメントタイプを選択"
            />
            <TimeEntrySelectField
              label="メインカテゴリ"
              options={mainCategoryOptions}
              placeholder="メインカテゴリを選択"
            />
            <TimeEntrySelectField
              label="サブカテゴリ"
              options={subCategoryOptions}
              placeholder="サブカテゴリを選択"
            />
            <TimeEntrySelectField label="タスク" options={taskOptions} placeholder="タスクを選択" />
            <TimeEntryTextareaField
              label="コメント"
              placeholder="コメントを入力"
              rows={4}
              rightSlot={<span className="time-entry-count">0/2000</span>}
            />
          </div>
        </div>
      </Modal>
      <ResourceSelectModal
        open={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        selectedResources={selectedResources}
        onSave={handleResourceSave}
      />
      <DeleteConfirmModal
        open={isDeleteConfirmModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export default TimeEntryModal;

