import { useState, useEffect, useRef, useMemo } from 'react';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  inputType?: 'text' | 'lookup' | 'select' | 'datetime';
  options?: (string | { label?: string; value: string })[];
}

export type RowData = Record<string, any>;

interface UseSubGridTableProps {
  columns: Column[];
  data: RowData[];
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  rowsPerPage?: number;
}

export function useSubGridTable({
  columns,
  data,
  onSort,
  rowsPerPage = 5
}: UseSubGridTableProps) {
  const [sortState, setSortState] = useState<{ column: string | null; direction: 'asc' | 'desc' }>({
    column: null,
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const headerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages]);

  const updateColumnWidths = () => {
    const widths = headerRefs.current
      .filter(ref => ref !== null)
      .map(ref => ref?.offsetWidth || 0);
    if (widths.length > 0 && widths.some(w => w > 0)) {
      setColumnWidths(widths);
    }
  };

  useEffect(() => {
    updateColumnWidths();
    const handleResize = () => {
      setTimeout(updateColumnWidths, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [columns, currentData]);

  useEffect(() => {
    const timer = setTimeout(updateColumnWidths, 100);
    return () => clearTimeout(timer);
  }, [data, currentData]);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column || !column.sortable) return;

    const newDirection =
      sortState.column === columnKey && sortState.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortState({ column: columnKey, direction: newDirection });
    onSort?.(columnKey, newDirection);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return '';
      }
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      const hours = String(value.getHours()).padStart(2, '0');
      const minutes = String(value.getMinutes()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    return String(value);
  };

  return {
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
  };
}
