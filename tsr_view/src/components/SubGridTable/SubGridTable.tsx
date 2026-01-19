import { useState } from 'react';
import { FaPlus, FaTrash, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSubGridTable, type Column, type RowData } from './useSubGridTable';
import TableModal from '../TableModal/TableModal';
import './SubGridTable.css';

interface SubGridTableProps {
  label: string;
  columns: Column[];
  data: RowData[];
  onAdd?: (data: RowData) => void;
  onUpdate?: (index: number, data: RowData) => void;
  onDelete?: (index: number) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  scrollTargetId?: string;
  extraButtons?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    openAddModal?: boolean;
  }>;
}

export default function SubGridTable({
  label,
  columns,
  data,
  onAdd,
  onUpdate,
  onDelete,
  onSort,
  scrollTargetId: _scrollTargetId,
  extraButtons
}: SubGridTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const {
    sortState,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentData,
    columnWidths,
    headerRefs,
    handleSort,
    handlePageChange,
    getPageNumbers,
    formatCellValue
  } = useSubGridTable({ columns, data, onSort });

  const getSortIcon = (columnKey: string) => {
    if (sortState.column !== columnKey) {
      return <FaSort className="subgrid-sort-icon" />;
    }
    return sortState.direction === 'asc'
      ? <FaSortUp className="subgrid-sort-icon-active" />
      : <FaSortDown className="subgrid-sort-icon-active" />;
  };

  const handleAddClick = () => {
    setModalMode('add');
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleRowClick = (index: number) => {
    if (onUpdate) {
      setModalMode('edit');
      setEditingIndex(index);
      setIsModalOpen(true);
    }
  };

  const handleModalSave = (newData: RowData) => {
    if (modalMode === 'add' && onAdd) {
      onAdd(newData);
    } else if (modalMode === 'edit' && editingIndex !== null && onUpdate) {
      onUpdate(editingIndex, newData);
    }
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onDelete?.(index);
  };

  return (
    <>
      <div className="subgrid-container">
        <div className="subgrid-header">
          <div className="subgrid-header-left">
            <span className="subgrid-label">{label}</span>
            {onAdd && (
              <button
                onClick={handleAddClick}
                className="subgrid-add-button"
                aria-label="追加"
              >
                <FaPlus />
              </button>
            )}
          </div>
          {extraButtons && (
            <div className="subgrid-extra-buttons">
              {extraButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (button.openAddModal) {
                      handleAddClick();
                    } else {
                      button.onClick();
                    }
                  }}
                  className="subgrid-extra-button"
                >
                  {button.icon}
                  <span>{button.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="subgrid-table-wrapper">
          <div className="subgrid-table-header">
            <div className="subgrid-table-header-row">
              {columns.map((column, index) => (
                <div
                  key={column.key}
                  ref={(el) => {
                    headerRefs.current[index] = el;
                  }}
                  className={`subgrid-header-cell ${index < columns.length - 1 ? 'subgrid-header-cell-border' : ''} ${column.sortable ? 'subgrid-header-cell-sortable' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="subgrid-header-cell-content">
                    {column.sortable && (
                      <span className="subgrid-sort-icon-wrapper">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                    <span className="subgrid-header-label">{column.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="subgrid-table-body">
            {currentData.length > 0 ? (
              currentData.map((row, displayIndex) => {
                const actualIndex = startIndex + displayIndex;
                return (
                  <div
                    key={actualIndex}
                    className={`subgrid-row ${onUpdate ? 'subgrid-row-clickable' : ''}`}
                    onClick={() => onUpdate && handleRowClick(actualIndex)}
                  >
                    <div className="subgrid-row-content">
                      {columns.map((column, colIndex) => (
                        <div
                          key={column.key}
                          className="subgrid-cell"
                          style={{
                            width: columnWidths[colIndex] && columnWidths[colIndex] > 0
                              ? `${columnWidths[colIndex]}px`
                              : 'auto',
                            minWidth: '120px',
                            maxWidth: columnWidths[colIndex] && columnWidths[colIndex] > 0
                              ? `${columnWidths[colIndex]}px`
                              : 'none',
                            ...(colIndex < columns.length - 1 ? { borderRight: '1px solid #d1d5db' } : {})
                          }}
                        >
                          {colIndex === 0 && onDelete ? (
                            <div className="subgrid-cell-with-delete">
                              <button
                                onClick={(e) => handleDeleteClick(e, actualIndex)}
                                className="subgrid-delete-button"
                                aria-label="削除"
                              >
                                <FaTrash />
                              </button>
                              <span className={`subgrid-cell-text ${onUpdate ? 'subgrid-cell-text-clickable' : ''}`} title={formatCellValue(row[column.key])}>
                                {formatCellValue(row[column.key])}
                              </span>
                            </div>
                          ) : (
                            <span className={`subgrid-cell-text ${onUpdate ? 'subgrid-cell-text-clickable' : ''}`} title={formatCellValue(row[column.key])}>
                              {formatCellValue(row[column.key])}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="subgrid-empty">
                データがありません
              </div>
            )}
          </div>
        </div>

        {data.length > 0 && (
          <div className="subgrid-footer">
            <div className="subgrid-footer-info">
              {startIndex + 1} - {Math.min(endIndex, data.length)} / {data.length} 件
            </div>
            <div className="subgrid-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`subgrid-pagination-button ${currentPage === 1 ? 'subgrid-pagination-button-disabled' : ''}`}
                aria-label="前のページ"
              >
                <FaChevronLeft />
              </button>
              <div className="subgrid-pagination-numbers">
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="subgrid-pagination-ellipsis">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page as number)}
                        className={`subgrid-pagination-number ${currentPage === page ? 'subgrid-pagination-number-active' : ''}`}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`subgrid-pagination-button ${currentPage === totalPages ? 'subgrid-pagination-button-disabled' : ''}`}
                aria-label="次のページ"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <TableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIndex(null);
        }}
        columns={columns}
        initialData={editingIndex !== null ? data[editingIndex] : null}
        onSave={handleModalSave}
        mode={modalMode}
      />
    </>
  );
}
