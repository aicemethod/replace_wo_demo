import { FiImage } from 'react-icons/fi'
import { StepidDropdown } from './StepidDropdown'
import { FileAttachmentEditor } from './FileAttachmentEditor'
import { ReportOutputToggle } from './ReportOutputToggle'
import type { PostRowProps } from './types'
import './PostRow.css'

export const PostRow = ({
  post,
  index,
  isEditing,
  isDeleting,
  isSelected,
  isNew,
  isSectionD,
  editTitle,
  editContent,
  editFile,
  editStepid,
  editHasReportOutput,
  openDropdownId,
  dropdownPosition,
  fileInputRef,
  selectedPostId,
  getStepidOptions,
  onCheckboxChange,
  onEditTitleChange,
  onEditContentChange,
  onEditFileChange,
  onRemoveFile,
  onStepidChange,
  onDropdownToggle,
  onDropdownClose,
  onToggleReportOutput,
  onDownloadAttachment,
  onEditHasReportOutputChange
}: PostRowProps) => {
  return (
    <tr
      className={`posttable-row ${isDeleting ? 'posttable-row-deleting' : ''} ${isNew ? 'posttable-row-new' : ''}`}
    >
      <td className="posttable-td posttable-td-center">
        <label
          className={`posttable-checkbox-label ${isNew || (isSelected ? false : selectedPostId !== null) ? 'posttable-checkbox-label-disabled' : ''}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onCheckboxChange(post.id)}
            disabled={isNew || (isSelected ? false : selectedPostId !== null)}
            className="posttable-checkbox"
          />
          <div className={`posttable-checkbox-box ${isSelected ? 'posttable-checkbox-box-checked' : ''}`}>
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </label>
      </td>

      {!isSectionD && (
        <td className="posttable-td">
          {isEditing ? (
            <StepidDropdown
              post={post}
              editStepid={editStepid}
              openDropdownId={openDropdownId}
              dropdownPosition={dropdownPosition}
              getStepidOptions={getStepidOptions}
              onStepidChange={onStepidChange}
              onDropdownToggle={onDropdownToggle}
              onDropdownClose={onDropdownClose}
            />
          ) : (
            <div className="posttable-text posttable-text-stepid">
              {post.stepid !== null && post.stepid !== undefined && post.stepid !== '' ? post.stepid : index + 1}
            </div>
          )}
        </td>
      )}

      {!isSectionD && (
        <td className="posttable-td posttable-td-center">
          {isEditing ? (
            <ReportOutputToggle
              checked={editHasReportOutput}
              onChange={onEditHasReportOutputChange}
            />
          ) : (
            <ReportOutputToggle
              checked={post.hasReportOutput || false}
              onChange={() => onToggleReportOutput(post.id)}
            />
          )}
        </td>
      )}

      <td className="posttable-td">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="posttable-input"
          />
        ) : (
          <div className="posttable-text posttable-text-title">{post.title}</div>
        )}
      </td>

      <td className="posttable-td">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            rows={3}
            className="posttable-textarea"
          />
        ) : (
          <div className="posttable-text posttable-text-content">{post.content}</div>
        )}
      </td>

      <td className="posttable-td">
        {isEditing ? (
          <FileAttachmentEditor
            editFile={editFile}
            attachmentName={post.attachmentName}
            fileInputRef={fileInputRef}
            onFileChange={onEditFileChange}
            onRemoveFile={onRemoveFile}
          />
        ) : (
          post.attachmentName ? (
            <div
              className="posttable-attachment-link"
              onClick={() => onDownloadAttachment(post.attachmentName)}
              style={{ cursor: 'pointer' }}
              title="クリックしてダウンロード"
            >
              <FiImage size={16} />
              <span className="posttable-file-name">{post.attachmentName}</span>
            </div>
          ) : (
            <div className="posttable-text posttable-text-empty">-</div>
          )
        )}
      </td>
    </tr>
  )
}
