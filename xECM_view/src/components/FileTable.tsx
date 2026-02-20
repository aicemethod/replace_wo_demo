import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSave, FiRefreshCw, FiPlus, FiTrash2, FiPaperclip, FiChevronDown } from 'react-icons/fi';
import type { FileData } from '../types';
import { fetchFileData, saveFileAttachment, deleteFileAttachments } from '../services/dataverse';
import { formatDate } from '../utils/dateFormatter';
import './FileTable.css';

export default function FileTable() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [deleteSelectedIds, setDeleteSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileType, setNewFileType] = useState('TSR');
  const [newFileTypeValue, setNewFileTypeValue] = useState(931440001);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const data = await fetchFileData();
      setFiles(data);
      setDeleteSelectedIds(new Set());
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filetable-add-dropdown') && !target.closest('.filetable-add-menu')) {
        setIsAddMenuOpen(false);
        setAddMenuPosition(null);
      }
    };

    if (isAddMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isAddMenuOpen]);

  const handleToggleSelect = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, selected: !file.selected } : file
      )
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const handleDeleteCheckToggle = (id: string) => {
    setDeleteSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (deleteSelectedIds.size === 0) {
      return;
    }
    setIsDeleting(true);
    try {
      const targetIds = Array.from(deleteSelectedIds);
      const deletedIds = await deleteFileAttachments(targetIds);
      if (deletedIds.length > 0) {
        const deletedSet = new Set(deletedIds);
        setFiles((prevFiles) => prevFiles.filter((file) => !deletedSet.has(file.id)));
      }
      setDeleteSelectedIds(new Set());
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (showAddRow) {
        if (!newFile) {
          console.warn('添付ファイルが選択されていません');
          return;
        }
        const saved = await saveFileAttachment({
          typeValue: newFileTypeValue,
          typeLabel: newFileType,
          filename: newFile.name,
          file: newFile
        });
        if (saved) {
          setFiles((prevFiles) => [saved, ...prevFiles]);
          setShowAddRow(false);
          setNewFilename('');
          setNewFileType('TSR');
          setNewFileTypeValue(931440001);
          setNewFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setIsAddMenuOpen(false);
          setAddMenuPosition(null);
        }
        return;
      }
      // TODO: 選択されたファイルの保存処理を実装
      const selectedFiles = files.filter((file) => file.selected);
      console.log('保存するファイル:', selectedFiles);
      // ここに保存処理を追加
      await new Promise((resolve) => setTimeout(resolve, 500)); // 仮の処理
    } catch (error) {
      console.error('保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (file: FileData) => {
    if (!file.documentbody) {
      return;
    }
    const byteCharacters = atob(file.documentbody);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename || 'attachment.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleAddMenuToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAddMenuOpen) {
      setIsAddMenuOpen(false);
      setAddMenuPosition(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setAddMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    });
    setIsAddMenuOpen(true);
  }, [isAddMenuOpen]);

  const selectableTypes = new Set(['TSR', '技術検収書(Technical Acceptance)']);
  const deleteSelectedCount = files.filter((file) => deleteSelectedIds.has(file.id)).length;
  const addMenuOptions = [
    { value: 931440001, label: 'TSR' },
    { value: 931440002, label: '技術検収書(Technical Acceptance)' },
    { value: 931440003, label: 'Technical Document' },
    { value: 931440000, label: 'Other' }
  ];

  const handleAddOption = (value: number) => {
    const typeLabel = addMenuOptions.find((option) => option.value === value)?.label || 'TSR';
    setNewFileTypeValue(value);
    setNewFileType(typeLabel);
    setShowAddRow(true);
    setIsAddMenuOpen(false);
    setAddMenuPosition(null);
  };

  const handleAddCancel = () => {
    setShowAddRow(false);
    setNewFilename('');
    setNewFileType('TSR');
    setNewFileTypeValue(931440001);
    setNewFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewFile(file);
    if (file && !newFilename) {
      setNewFilename(file.name);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="file-table-container">
      <div className="file-table-header">
        <div className="file-table-actions">
          <div className="filetable-add-wrapper filetable-add-dropdown">
            <button
              type="button"
              className={`action-button action-button-neutral action-button-menu ${isAddMenuOpen ? 'is-open' : ''}`}
              onClick={handleAddMenuToggle}
              title="追加"
            >
              <FiPlus size={16} />
              <span>追加</span>
              <FiChevronDown size={14} className="action-button-menu-caret" />
            </button>
            {isAddMenuOpen && addMenuPosition && (
              <div
                className="filetable-add-menu"
                style={{
                  top: `${addMenuPosition.top}px`,
                  left: `${addMenuPosition.left}px`,
                  width: `${addMenuPosition.width}px`
                }}
              >
                {addMenuOptions.map((option) => (
                  <div
                    key={option.value}
                    className="filetable-add-item"
                    onClick={() => handleAddOption(option.value)}
                  >
                    <FiPlus size={14} />
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="action-button action-button-neutral action-button-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="更新"
          >
            <FiRefreshCw
              size={16}
              className={isRefreshing ? 'action-button-icon-spin' : ''}
            />
            <span>更新</span>
          </button>
          <button
            type="button"
            className="action-button action-button-primary"
            onClick={handleSave}
            disabled={isSaving || (!showAddRow && files.filter((f) => f.selected).length === 0)}
            title="保存"
          >
            <FiSave size={16} />
            <span>保存</span>
          </button>
          {showAddRow ? (
            <button
              type="button"
              className="action-button action-button-danger"
              onClick={handleAddCancel}
              title="キャンセル"
            >
              <FiTrash2 size={16} />
              <span>キャンセル</span>
            </button>
          ) : (
            <button
              type="button"
              className="action-button action-button-danger"
              onClick={handleDeleteSelected}
              disabled={deleteSelectedCount === 0 || isDeleting}
              title="削除"
            >
              <FiTrash2 size={16} />
              <span>削除</span>
            </button>
          )}
        </div>
      </div>
      {/* デスクトップ用テーブル表示 */}
      <div className="file-table-wrapper">
        <table className="file-table">
          <thead>
            <tr>
              <th className="col-delete"></th>
              <th className="col-select">xECM連携対象</th>
              <th className="col-filename">ファイル名</th>
              <th className="col-type">ファイル種別</th>
              <th className="col-created">保存日時</th>
              <th className="col-sync">連携実行日</th>
            </tr>
          </thead>
          <tbody>
            {showAddRow && (
              <tr className="file-table-add-row">
                <td className="col-delete">
                  <label className="file-delete-checkbox file-delete-checkbox-disabled">
                    <input type="checkbox" checked={false} disabled aria-label="削除選択不可" />
                    <span className="file-delete-checkbox-box"></span>
                  </label>
                </td>
                <td className="col-select">
                  <label className="toggle-switch toggle-switch-disabled">
                    <input type="checkbox" checked={false} disabled aria-label="選択不可" />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td className="col-filename">
                  <div className="file-table-input-row">
                    <input
                      type="text"
                      className="file-table-input"
                      value={newFilename}
                      onChange={(e) => setNewFilename(e.target.value)}
                      placeholder="ファイル名"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-table-file-input"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      className="file-table-attach-button"
                      onClick={() => fileInputRef.current?.click()}
                      title="添付"
                    >
                      <FiPaperclip size={16} />
                    </button>
                  </div>
                  {newFile && <div className="file-table-file-preview">{newFile.name}</div>}
                </td>
                <td className="col-type">
                  <span className="file-table-type-text">{newFileType}</span>
                </td>
                <td className="col-created">-</td>
                <td className="col-sync">-</td>
              </tr>
            )}
            {files.length === 0 && !showAddRow ? (
              <tr>
                <td colSpan={6} className="no-data">
                  データがありません
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id}>
                  <td className="col-delete">
                    <label className="file-delete-checkbox">
                      <input
                        type="checkbox"
                        checked={deleteSelectedIds.has(file.id)}
                        onChange={() => handleDeleteCheckToggle(file.id)}
                        aria-label={deleteSelectedIds.has(file.id) ? '削除選択解除' : '削除選択'}
                      />
                      <span className="file-delete-checkbox-box"></span>
                    </label>
                  </td>
                  <td className="col-select">
                    <label className={`toggle-switch ${selectableTypes.has(file.Mimetype) ? '' : 'toggle-switch-disabled'}`}>
                      <input
                        type="checkbox"
                        checked={file.selected}
                        onChange={() => handleToggleSelect(file.id)}
                        aria-label={file.selected ? '選択解除' : '選択'}
                        disabled={!selectableTypes.has(file.Mimetype)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td className="col-filename">
                    {file.documentbody ? (
                      <button
                        type="button"
                        className="file-table-link"
                        onClick={() => handleDownload(file)}
                      >
                        {file.filename}
                      </button>
                    ) : (
                      file.filename
                    )}
                  </td>
                  <td className="col-type">{file.Mimetype}</td>
                  <td className="col-created">{formatDate(file.createdon)}</td>
                  <td className="col-sync">-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* モバイル用カード表示 */}
      <div className="file-cards">
        {files.length === 0 ? (
          <div className="no-data">データがありません</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className={`file-card ${file.selected ? 'selected' : ''}`}>
              <div className="file-card-header">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={file.selected}
                    onChange={() => handleToggleSelect(file.id)}
                    aria-label={file.selected ? '選択解除' : '選択'}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <div className="file-card-filename">{file.filename}</div>
              </div>
              <div className="file-card-body">
                <div className="file-card-row">
                  <span className="file-card-label">ファイル種別:</span>
                  <span className="file-card-value">{file.Mimetype}</span>
                </div>
                <div className="file-card-row">
                  <span className="file-card-label">保存日時:</span>
                  <span className="file-card-value">{formatDate(file.createdon)}</span>
                </div>
                <div className="file-card-row">
                  <span className="file-card-label">連携実行日:</span>
                  <span className="file-card-value">-</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
