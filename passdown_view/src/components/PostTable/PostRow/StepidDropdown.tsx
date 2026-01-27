import { FiChevronDown } from 'react-icons/fi'
import type { StepidDropdownProps } from './types'

export const StepidDropdown = ({
  post,
  editStepid,
  openDropdownId,
  dropdownPosition,
  getStepidOptions,
  onStepidChange,
  onDropdownToggle,
  onDropdownClose
}: StepidDropdownProps) => {
  const dropdownId = `dropdown-${post.id}`
  const isOpen = openDropdownId === dropdownId
  const options = getStepidOptions(post)
  const selectedValue = editStepid !== null && editStepid !== undefined ? editStepid : ''
  const selectedLabel = selectedValue ? options.find(opt => opt.value === selectedValue)?.value || '' : ''

  return (
    <div className="custom-dropdown">
      <div
        onClick={(e) => {
          if (!isOpen) {
            const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
            onDropdownToggle(dropdownId, {
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width
            })
          } else {
            onDropdownClose()
          }
        }}
        className={`posttable-dropdown-trigger ${selectedValue ? '' : 'posttable-dropdown-trigger-placeholder'}`}
      >
        <span>{selectedLabel}{selectedValue && options.find(opt => opt.value === selectedValue)?.isUsed ? ' (使用中)' : ''}</span>
        <FiChevronDown size={16} className={`posttable-dropdown-icon ${isOpen ? 'posttable-dropdown-icon-open' : ''}`} />
      </div>
      {isOpen && dropdownPosition && (
        <div
          className="dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div onClick={() => onStepidChange(null)} className="posttable-dropdown-item posttable-dropdown-item-empty" />
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                if (!opt.isUsed) {
                  onStepidChange(opt.value)
                  onDropdownClose()
                }
              }}
              className={`posttable-dropdown-item ${opt.value === selectedValue ? 'posttable-dropdown-item-selected' : ''} ${opt.isUsed ? 'posttable-dropdown-item-disabled' : ''}`}
            >
              {opt.value}{opt.isUsed ? ' (使用中)' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
