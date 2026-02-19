import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSave, FiRefreshCw, FiPlus, FiTrash2, FiPaperclip } from 'react-icons/fi';
import type { FileData } from '../types';
import { fetchFileData, saveFileAttachment } from '../services/dataverse';
import { formatDate } from '../utils/dateFormatter';
import './FileTable.css';

export default function FileTable() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileType, setNewFileType] = useState('Passdown/Daily Report');
  const [newFileTypeValue, setNewFileTypeValue] = useState(931440007);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const data = await fetchFileData();
      setFiles(data);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
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
          setNewFileType('Passdown/Daily Report');
          setNewFileTypeValue(931440007);
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

  const addMenuOptions = [
    { value: 931440007, label: 'Passdown/Daily Report' },
    { value: 931440008, label: 'PPAC/YKM' },
    { value: 931440009, label: 'Technical Document' },
    { value: 931440006, label: 'Other' }
  ];

  const handleAddOption = (value: number) => {
    const typeLabel = addMenuOptions.find((option) => option.value === value)?.label || 'Passdown/Daily Report';
    setNewFileTypeValue(value);
    setNewFileType(typeLabel);
    setShowAddRow(true);
    setIsAddMenuOpen(false);
    setAddMenuPosition(null);
  };

  const handleAddCancel = () => {
    setShowAddRow(false);
    setNewFilename('');
    setNewFileType('Passdown/Daily Report');
    setNewFileTypeValue(931440007);
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
              className="action-button add-button"
              onClick={handleAddMenuToggle}
              style={{
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#333',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="追加"
            >
              <FiPlus size={16} />
              <span>追加</span>
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
            className="action-button save-button"
            onClick={handleSave}
            disabled={isSaving || (!showAddRow && files.filter((f) => f.selected).length === 0)}
            style={{
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: isSaving || (!showAddRow && files.filter((f) => f.selected).length === 0) ? '#c7c7c7' : '#115ea3',
              fontSize: '14px',
              cursor: isSaving || (!showAddRow && files.filter((f) => f.selected).length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSaving || (!showAddRow && files.filter((f) => f.selected).length === 0) ? 0.7 : 1
            }}
            title="保存"
          >
            <FiSave size={16} />
            <span>保存</span>
          </button>
          {showAddRow && (
            <button
              type="button"
              className="action-button cancel-button"
              onClick={handleAddCancel}
              style={{
                padding: '0',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#d32f2f',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="キャンセル"
            >
              <FiTrash2 size={16} />
              <span>キャンセル</span>
            </button>
          )}
          <button
            type="button"
            className="action-button refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#333',
              fontSize: '14px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isRefreshing ? 0.6 : 1
            }}
          >
            <FiRefreshCw
              size={16}
              style={{
                animation: isRefreshing ? 'spin 0.8s ease-in-out infinite' : 'none'
              }}
            />
            <span>更新</span>
          </button>
        </div>
      </div>
      {/* デスクトップ用テーブル表示 */}
      <div className="file-table-wrapper">
        <table className="file-table">
          <thead>
            <tr>
              <th className="col-filename">ファイル名</th>
              <th className="col-type">ファイル種別</th>
              <th className="col-created">保存日時</th>
              <th className="col-sync">連携実行日</th>
            </tr>
          </thead>
          <tbody>
            {showAddRow && (
              <tr className="file-table-add-row">
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
                <td colSpan={4} className="no-data">
                  データがありません
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id}>
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
            <div key={file.id} className="file-card">
              <div className="file-card-header">
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
