import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import type { FileData } from '../types';
import { fetchFileData } from '../services/dataverse';
import { formatDate } from '../utils/dateFormatter';
import './FileTable.css';

export default function FileTable() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
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

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="file-table-container">
      <div className="file-table-header">
        <div className="file-table-actions">
          <button
            type="button"
            className="action-button save-button"
            onClick={handleSave}
            disabled={isSaving || files.filter((f) => f.selected).length === 0}
            style={{
              padding: '0',
              border: 'none',
              backgroundColor: 'transparent',
              color: isSaving || files.filter((f) => f.selected).length === 0 ? '#bbb' : '#115ea3',
              fontSize: '14px',
              cursor: isSaving || files.filter((f) => f.selected).length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSaving || files.filter((f) => f.selected).length === 0 ? 0.5 : 1
            }}
            title="保存"
          >
            <FiSave size={16} />
            <span>保存</span>
          </button>
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
              <th className="col-select">選択</th>
              <th className="col-filename">ファイル名</th>
              <th className="col-type">ファイル種別</th>
              <th className="col-created">保存日時</th>
              <th className="col-sync">連携実行日</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">
                  データがありません
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id}>
                  <td className="col-select">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={file.selected}
                        onChange={() => handleToggleSelect(file.id)}
                        aria-label={file.selected ? '選択解除' : '選択'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td className="col-filename">{file.filename}</td>
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

