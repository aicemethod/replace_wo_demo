import type { Post } from '../../../types'

export interface PostRowProps {
  post: Post
  index: number
  isEditing: boolean
  isDeleting: boolean
  isSelected: boolean
  isNew: boolean
  isSectionD: boolean
  editTitle: string
  editContent: string
  editFile: File | null
  editStepid: string | null
  editHasReportOutput: boolean
  openDropdownId: string | null
  dropdownPosition: { top: number; left: number; width: number } | null
  fileInputRef: React.RefObject<HTMLInputElement | null>
  selectedPostId: string | null
  getStepidOptions: (post: Post) => Array<{ value: string; isUsed: boolean }>
  onCheckboxChange: (postId: string) => void
  onEditTitleChange: (value: string) => void
  onEditContentChange: (value: string) => void
  onEditFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: () => void
  onStepidChange: (value: string | null) => void
  onDropdownToggle: (dropdownId: string, position: { top: number; left: number; width: number }) => void
  onDropdownClose: () => void
  onToggleReportOutput: (postId: string) => void
  onDownloadAttachment: (attachmentName: string) => void
  onEditHasReportOutputChange: (value: boolean) => void
}

export interface StepidDropdownProps {
  post: Post
  editStepid: string | null
  openDropdownId: string | null
  dropdownPosition: { top: number; left: number; width: number } | null
  getStepidOptions: (post: Post) => Array<{ value: string; isUsed: boolean }>
  onStepidChange: (value: string | null) => void
  onDropdownToggle: (dropdownId: string, position: { top: number; left: number; width: number }) => void
  onDropdownClose: () => void
}

export interface FileAttachmentEditorProps {
  editFile: File | null
  attachmentName: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: () => void
}
