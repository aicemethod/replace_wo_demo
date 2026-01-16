import './PostRow.css'

interface ReportOutputToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const ReportOutputToggle = ({ checked, onChange, disabled = false }: ReportOutputToggleProps) => {
  return (
    <label className="posttable-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="posttable-toggle-input"
      />
      <span className={`posttable-toggle-slider ${checked ? 'posttable-toggle-slider-checked' : ''}`} />
    </label>
  )
}
