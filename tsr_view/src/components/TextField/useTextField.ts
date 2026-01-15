import { useState, useEffect } from 'react'

interface UseTextFieldProps {
  value?: string
  onChange?: (value: string) => void
  hasError?: boolean
  error?: string
}

export function useTextField({ value, onChange, hasError, error }: UseTextFieldProps) {
  const [internalValue, setInternalValue] = useState<string>(value || '')
  const [shouldShake, setShouldShake] = useState(false)

  useEffect(() => {
    if (hasError && error) {
      setShouldShake(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldShake(true)
        })
      })
    }
  }, [hasError, error])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const currentValue = value !== undefined ? value : internalValue

  return {
    currentValue,
    shouldShake,
    handleChange
  }
}
