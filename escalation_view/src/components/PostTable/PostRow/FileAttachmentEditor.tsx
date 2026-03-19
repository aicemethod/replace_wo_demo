import { FiImage, FiPaperclip, FiXCircle } from 'react-icons/fi'
import type { FileAttachmentEditorProps } from './types'

export const FileAttachmentEditor = ({
  editFile,
  attachmentName,
  fileInputRef,
  onFileChange,
  onRemoveFile
}: FileAttachmentEditorProps) => {
  return (
    <div className="posttable-file-area">
      <label className="posttable-file-label">
        <FiPaperclip size={16} />
        <span>ファイルを添付</span>
        <input ref={fileInputRef} type="file" onChange={onFileChange} className="posttable-file-input" />
      </label>
      {editFile && (
        <div className="posttable-file-info">
          <FiPaperclip size={14} />
          <span className="posttable-file-name">{editFile.name}</span>
          <button type="button" onClick={onRemoveFile} className="posttable-file-remove" title="ファイルを削除">
            <FiXCircle size={14} />
          </button>
        </div>
      )}
      {attachmentName && !editFile && (
        <div className="posttable-file-info">
          <FiImage size={14} />
          <span className="posttable-file-name">{attachmentName}</span>
          <button type="button" onClick={onRemoveFile} className="posttable-file-remove" title="既存ファイルを削除">
            <FiXCircle size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
