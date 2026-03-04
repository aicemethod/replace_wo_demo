import { useEffect, useRef, useState, type JSX } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import './SelectButton.css'

type SelectOption = {
  value: string
  label: string
}

export type SelectButtonProps = {
  options?: SelectOption[]
  defaultValue?: string
}

export function SelectButton({
  options = [],
  defaultValue = '',
}: SelectButtonProps): JSX.Element {
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ?? ''

  const selectOption = (value: string) => {
    setSelectedValue(value)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className={`select-button ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="select-button-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="select-button-text">{selectedLabel}</span>
        <span className="select-button-icon" aria-hidden="true">
          <FaChevronDown />
        </span>
      </button>

      <div className="select-button-options" role="listbox">
        <button
          type="button"
          className={`select-button-option ${selectedValue === '' ? 'selected' : ''}`}
          onClick={() => selectOption('')}
        />

        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`select-button-option ${selectedValue === option.value ? 'selected' : ''}`}
            onClick={() => selectOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
