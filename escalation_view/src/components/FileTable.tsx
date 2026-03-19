import { useState, useEffect, useRef } from 'react';
import { FiSave, FiRefreshCw, FiPlus, FiTrash2, FiPaperclip } from 'react-icons/fi';
import type { FileData } from '../types';
import { fetchFileData, saveFileAttachment } from '../services/dataverse';
import { formatDate } from '../utils/dateFormatter';
import { getMessages, type AppLocale } from '../i18n';
import './FileTable.css';

type FileTableProps = {
  locale: AppLocale;
};

export default function FileTable({ locale }: FileTableProps) {
  const msg = getMessages(locale);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
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
          filename: newFile.name,
          title: newTitle,
          note: newNote,
          file: newFile
        });
        if (saved) {
          setFiles((prevFiles) => [saved, ...prevFiles]);
          setShowAddRow(false);
          setNewFilename('');
          setNewTitle('');
          setNewNote('');
          setNewFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        return;
      }
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

  const handleAdd = () => {
    setShowAddRow(true);
  };

  const handleAddCancel = () => {
    setShowAddRow(false);
    setNewFilename('');
    setNewTitle('');
    setNewNote('');
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
    return <div className="loading">{msg.loading}</div>;
  }

  return (
    <div className="file-table-container">
      <div className="file-table-header">
        <div className="file-table-actions">
          <button
            type="button"
            className="action-button action-button-neutral"
            onClick={handleAdd}
            disabled={showAddRow}
            title={msg.add}
          >
            <FiPlus size={16} />
            <span>{msg.add}</span>
          </button>
          <button
            type="button"
            className="action-button action-button-primary"
            onClick={handleSave}
            disabled={isSaving || !showAddRow}
            title={msg.save}
          >
            <FiSave size={16} />
            <span>{msg.save}</span>
          </button>
          {showAddRow && (
            <button
              type="button"
              className="action-button action-button-danger"
              onClick={handleAddCancel}
              title={msg.cancel}
            >
              <FiTrash2 size={16} />
              <span>{msg.cancel}</span>
            </button>
          )}
          <button
            type="button"
            className="action-button action-button-neutral action-button-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={msg.refresh}
          >
            <FiRefreshCw
              size={16}
              className={isRefreshing ? 'action-button-icon-spin' : ''}
            />
            <span>{msg.refresh}</span>
          </button>
        </div>
      </div>
      {/* デスクトップ用テーブル表示 */}
      <div className="file-table-wrapper">
        <table className="file-table">
          <thead>
            <tr>
              <th className="col-filename">{msg.headerFilename}</th>
              <th className="col-type">{msg.headerType}</th>
              <th className="col-created">{msg.headerCreated}</th>
              <th className="col-sync">{msg.headerSync}</th>
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
                      placeholder={msg.placeholderFilename}
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
                      title={msg.attach}
                    >
                      <FiPaperclip size={16} />
                    </button>
                  </div>
                  {newFile && <div className="file-table-file-preview">{newFile.name}</div>}
                </td>
                <td className="col-type">
                  <input
                    type="text"
                    className="file-table-input"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={msg.placeholderTitle}
                  />
                </td>
                <td className="col-created">
                  <textarea
                    className="file-table-textarea"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={msg.placeholderNote}
                    rows={3}
                  />
                </td>
                <td className="col-sync">-</td>
              </tr>
            )}
            {files.length === 0 && !showAddRow ? (
              <tr>
                <td colSpan={4} className="no-data">
                  {msg.noData}
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
                  <td className="col-type">{file.title}</td>
                  <td className="col-created">{file.note}</td>
                  <td className="col-sync">{formatDate(file.createdon, locale)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* モバイル用カード表示 */}
      <div className="file-cards">
        {files.length === 0 ? (
          <div className="no-data">{msg.noData}</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-card-header">
                <div className="file-card-filename">{file.filename}</div>
              </div>
              <div className="file-card-body">
                <div className="file-card-row">
                  <span className="file-card-label">{msg.mobileType}:</span>
                  <span className="file-card-value">{file.title}</span>
                </div>
                <div className="file-card-row">
                  <span className="file-card-label">{msg.mobileCreated}:</span>
                  <span className="file-card-value file-card-note">{file.note}</span>
                </div>
                <div className="file-card-row">
                  <span className="file-card-label">{msg.mobileSync}:</span>
                  <span className="file-card-value">{formatDate(file.createdon, locale)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
