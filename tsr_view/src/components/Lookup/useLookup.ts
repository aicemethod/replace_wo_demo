import { useState, useEffect, useRef, useMemo } from 'react'

export type LookupOption = string | { label?: string; value: string }

interface UseLookupProps {
  options: LookupOption[]
  selected?: string
  onSelect?: (option: string) => void
  disabled?: boolean
}

export function useLookup({ options, selected, onSelect, disabled }: UseLookupProps) {
  const [inputValue, setInputValue] = useState<string>(selected || '')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected !== undefined) {
      setInputValue(selected)
    }
  }, [selected])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getOptionValue = (option: LookupOption): string => {
    return typeof option === 'string' ? option : option.value
  }

  const getOptionLabel = (option: LookupOption): string | undefined => {
    return typeof option === 'string' ? undefined : option.label
  }

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options
    const searchLower = inputValue.toLowerCase()
    return options.filter(option => {
      const value = getOptionValue(option)
      const label = getOptionLabel(option)
      return value.toLowerCase().includes(searchLower) ||
        (label && label.toLowerCase().includes(searchLower))
    })
  }, [inputValue, options])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setIsOpen(value.trim().length > 0)
    if (!value) {
      onSelect?.('')
    }
  }

  const handleSelect = (option: LookupOption) => {
    if (disabled) return
    const value = getOptionValue(option)
    setInputValue(value)
    setIsOpen(false)
    onSelect?.(value)
  }

  const handleFocus = () => {
    if (inputValue.trim().length > 0) {
      setIsOpen(true)
    }
  }

  return {
    inputValue,
    isOpen,
    dropdownRef,
    filteredOptions,
    getOptionValue,
    getOptionLabel,
    handleInputChange,
    handleSelect,
    handleFocus
  }
}
