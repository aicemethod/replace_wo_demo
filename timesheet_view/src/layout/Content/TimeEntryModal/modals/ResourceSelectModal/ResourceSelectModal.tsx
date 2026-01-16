import { FaSortNumericDown, FaSortAlphaDown } from 'react-icons/fa';
import Button from '../../../../../components/elements/Button';
import Modal from '../../../../../components/elements/Modal';
import Checkbox from '../../../../../components/elements/Checkbox';
import RadioButton from '../../../../../components/elements/RadioButton';
import { useResourceSelectModal } from './useResourceSelectModal';
import './ResourceSelectModal.css';

import type { ResourceSelection } from '../../../../../types/user';

type ResourceSelectModalProps = {
  open: boolean;
  onClose: () => void;
  selectedResources?: ResourceSelection[];
  onSave: (resources: ResourceSelection[]) => void;
};

function ResourceSelectModal({ open, onClose, selectedResources = [], onSave }: ResourceSelectModalProps) {
  const {
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
  } = useResourceSelectModal({
    open,
    selectedResources,
    onSave,
    onClose,
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="resource-select-wrapper"
      panelClassName="resource-select-modal-panel"
      bodyClassName="resource-select-modal-body"
      footer={
        <>
          <Button variant="static" color="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          <Button variant="static" color="primary" onClick={handleSave} disabled={selectedIds.length === 0}>
            選択して反映
          </Button>
        </>
      }
    >
      <RadioButton
        name="resource-search-type"
        options={[
          { value: 'name', label: 'ユーザー名' },
          { value: 'number', label: '社員番号' },
        ]}
        value={searchType}
        onChange={(value) => setSearchType(value as 'name' | 'number')}
      />

      <div className="resource-select-search-row">
        <input
          type="text"
          className="resource-select-input"
          placeholder={searchPlaceholder}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      <div className="resource-select-sort-row">
        <Button variant="static" color="secondary" onClick={toggleSortByNumber}>
          <FaSortNumericDown aria-hidden="true" />
          社員番号 {sortByNumberAsc ? '▲' : '▼'}
        </Button>
        <Button variant="static" color="secondary" onClick={toggleSortByName}>
          <FaSortAlphaDown aria-hidden="true" />
          ユーザー名 {sortByNameAsc ? '▲' : '▼'}
        </Button>
      </div>

      {pinnedResource && (
        <label className="resource-select-option resource-select-fixed">
          <Checkbox
            checked={selectedIds.includes(pinnedResource.id)}
            onChange={() => toggleSelect(pinnedResource.id)}
            className="resource-select-checkbox"
          />
          <div className="resource-select-text">
            <span className="resource-select-number">{pinnedResource.number ?? '-'}</span>
            <span className="resource-select-name">{pinnedResource.name ?? '名称未設定'}</span>
          </div>
        </label>
      )}
      <div className="resource-select-list">
        {scrollableResources.length === 0 ? (
          <p className="resource-select-empty">該当するリソースが見つかりませんでした。</p>
        ) : (
          scrollableResources.map((resource) => (
            <label key={resource.id} className="resource-select-option">
              <Checkbox
                checked={selectedIds.includes(resource.id)}
                onChange={() => toggleSelect(resource.id)}
                className="resource-select-checkbox"
              />
              <div className="resource-select-text">
                <span className="resource-select-number">{resource.number ?? '-'}</span>
                <span className="resource-select-name">{resource.name ?? '名称未設定'}</span>
              </div>
            </label>
          ))
        )}
      </div>
    </Modal>
  );
}

export default ResourceSelectModal;

