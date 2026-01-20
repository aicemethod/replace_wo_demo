import { useState, useRef, useEffect } from 'react';
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const bodyEl = bodyRef.current;
    const headerEl = headerRef.current;
    if (!bodyEl || !headerEl) return;

    let isScrolling = false;

    const syncHeaderScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        headerEl.scrollLeft = bodyEl.scrollLeft;
        requestAnimationFrame(() => { isScrolling = false; });
      }
    };

    const syncBodyScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        bodyEl.scrollLeft = headerEl.scrollLeft;
        requestAnimationFrame(() => { isScrolling = false; });
      }
    };

    bodyEl.addEventListener('scroll', syncHeaderScroll, { passive: true });
    headerEl.addEventListener('scroll', syncBodyScroll, { passive: true });
    return () => {
      bodyEl.removeEventListener('scroll', syncHeaderScroll);
      headerEl.removeEventListener('scroll', syncBodyScroll);
    };
  }, []);

  const getSortIcon = (key: string) => {
    const icons = {
      default: <FaSort className="subgrid-sort-icon" />,
      asc: <FaSortUp className="subgrid-sort-icon-active" />,
      desc: <FaSortDown className="subgrid-sort-icon-active" />
    };
    return sortState.column === key ? icons[sortState.direction] : icons.default;
  };

  const openModal = (mode: 'add' | 'edit', index: number | null = null) => {
    setModalMode(mode);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleModalSave = (newData: RowData) => {
    modalMode === 'add' ? onAdd?.(newData) : editingIndex !== null && onUpdate?.(editingIndex, newData);
    closeModal();
  };

  const getCellStyle = (colIndex: number) => {
    const width = columnWidths[colIndex];
    return {
      width: width > 0 ? `${width}px` : 'auto',
      minWidth: '120px',
      maxWidth: width > 0 ? `${width}px` : 'none',
      ...(colIndex < columns.length - 1 && { borderRight: '1px solid #d1d5db' })
    };
  };

  const renderCell = (row: RowData, column: Column, colIndex: number, actualIndex: number) => {
    const value = formatCellValue(row[column.key]);
    const cellText = <span className={`subgrid-cell-text ${onUpdate ? 'subgrid-cell-text-clickable' : ''}`} title={value}>{value}</span>;
    return colIndex === 0 && onDelete ? (
      <div className="subgrid-cell-with-delete">
        <button onClick={(e) => { e.stopPropagation(); onDelete(actualIndex); }} className="subgrid-delete-button" aria-label="削除"><FaTrash /></button>
        {cellText}
      </div>
    ) : cellText;
  };

  return (
    <>
      <div className="subgrid-container">
        <div className="subgrid-header">
          <div className="subgrid-header-left">
            <span className="subgrid-label">{label}</span>
            {onAdd && <button onClick={() => openModal('add')} className="subgrid-add-button" aria-label="追加"><FaPlus /></button>}
          </div>
          {extraButtons && (
            <div className="subgrid-extra-buttons">
              {extraButtons.map((btn, i) => (
                <button key={i} onClick={() => btn.openAddModal ? openModal('add') : btn.onClick()} className="subgrid-extra-button">
                  {btn.icon}<span>{btn.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="subgrid-table-wrapper">
          <div className="subgrid-table-header" ref={headerRef}>
            <div className="subgrid-table-header-row">
              {columns.map((col, i) => (
                <div key={col.key} ref={(el) => { headerRefs.current[i] = el; }}
                  className={`subgrid-header-cell ${i < columns.length - 1 ? 'subgrid-header-cell-border' : ''} ${col.sortable ? 'subgrid-header-cell-sortable' : ''}`}
                  style={getCellStyle(i)}
                  onClick={() => col.sortable && handleSort(col.key)}>
                  <div className="subgrid-header-cell-content">
                    {col.sortable && <span className="subgrid-sort-icon-wrapper">{getSortIcon(col.key)}</span>}
                    <span className="subgrid-header-label">{col.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="subgrid-table-body" ref={bodyRef}>
            {currentData.length > 0 ? (
              <>
                {currentData.map((row, i) => {
                  const actualIndex = startIndex + i;
                  return (
                    <div key={actualIndex} className={`subgrid-row ${onUpdate ? 'subgrid-row-clickable' : ''}`}
                      onClick={() => onUpdate && openModal('edit', actualIndex)}>
                      <div className="subgrid-row-content">
                        {columns.map((col, colIndex) => (
                          <div key={col.key} className="subgrid-cell" style={getCellStyle(colIndex)}>
                            {renderCell(row, col, colIndex, actualIndex)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {Array.from({ length: Math.max(0, 5 - currentData.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="subgrid-row subgrid-row-empty" style={{ visibility: 'hidden' }}>
                    <div className="subgrid-row-content">
                      {columns.map((col, colIndex) => (
                        <div key={col.key} className="subgrid-cell" style={getCellStyle(colIndex)}>
                          <span className="subgrid-cell-text">&nbsp;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : <div className="subgrid-empty">データがありません</div>}
          </div>
        </div>

        {data.length > 0 && (
          <div className="subgrid-footer">
            <div className="subgrid-footer-info">{startIndex + 1} - {Math.min(endIndex, data.length)} / {data.length} 件</div>
            <div className="subgrid-pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                className={`subgrid-pagination-button ${currentPage === 1 ? 'subgrid-pagination-button-disabled' : ''}`} aria-label="前のページ">
                <FaChevronLeft />
              </button>
              <div className="subgrid-pagination-numbers">
                {getPageNumbers().map((page, i) => (
                  <div key={i}>{page === '...' ? <span className="subgrid-pagination-ellipsis">...</span> : (
                    <button onClick={() => handlePageChange(page as number)}
                      className={`subgrid-pagination-number ${currentPage === page ? 'subgrid-pagination-number-active' : ''}`}>
                      {page}
                    </button>
                  )}</div>
                ))}
              </div>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                className={`subgrid-pagination-button ${currentPage === totalPages ? 'subgrid-pagination-button-disabled' : ''}`} aria-label="次のページ">
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <TableModal isOpen={isModalOpen} onClose={closeModal} columns={columns}
        initialData={editingIndex !== null ? data[editingIndex] : null} onSave={handleModalSave} mode={modalMode} />
    </>
  );
}
