import { useEffect, useRef, useState, type JSX } from 'react'
import * as FaIcons from 'react-icons/fa'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import { Button } from '../button'
import './CalendarController.css'

type CalendarOption = {
  value: string
  label: string
}

export type CalendarControllerProps = {
  formattedDate: string
  onPrev?: () => void
  onNext?: () => void
  onToday?: () => void
  onCreate?: () => void
  onCopy?: () => void
  isCopyEnabled?: boolean
  options?: CalendarOption[]
  isSelectLoading?: boolean
}

export function CalendarController({
  formattedDate,
  onPrev,
  onNext,
  onToday,
  onCreate,
  onCopy,
  isCopyEnabled = false,
  options = [],
  isSelectLoading = false,
}: CalendarControllerProps): JSX.Element {
  const [selectOpen, setSelectOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedValue, setSelectedValue] = useState('')
  const selectWrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectWrapperRef.current && !selectWrapperRef.current.contains(event.target as Node)) {
        setSelectOpen(false)
        setSearchQuery('')
      }
    }

    if (selectOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectOpen])

  const filteredOptions = searchQuery.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ?? ''

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    setSelectOpen(false)
    setSearchQuery('')
  }

  return (
    <header className="tab-header">
      <div className="tab-header-left">
        <Button
          label="新しいタイムエントリを作成"
          color="primary"
          icon={<FaIcons.FaPlus />}
          className="new-create-button"
          onClick={onCreate}
        />

        <div
          ref={selectWrapperRef}
          className={`header-select-wrapper ${selectOpen ? 'open' : ''} ${isSelectLoading ? 'loading' : ''}`}
        >
          <div
            className="header-select-display"
            onClick={() => !isSelectLoading && setSelectOpen((current) => !current)}
            role="button"
            aria-expanded={selectOpen}
          >
            <span className={`header-select-text ${!selectedLabel ? 'placeholder' : ''}`}>
              {isSelectLoading ? '取得中...' : selectedLabel || '選択してください'}
            </span>
            <span className="header-select-icon">
              <FaIcons.FaChevronDown />
            </span>
          </div>

          {selectOpen && !isSelectLoading && (
            <div className="header-select-dropdown">
              <div className="header-select-search">
                <FaIcons.FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  autoFocus
                />
              </div>

              <div className="header-select-options">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`header-select-option ${option.value === selectedValue ? 'selected' : ''}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </div>
                  ))
                ) : (
                  <div className="header-select-option empty">
                    該当する項目がありません
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          label="1日分のタイムエントリをコピー"
          color="primary"
          icon={<FaIcons.FaPlus />}
          disabled={!isCopyEnabled}
          onClick={onCopy}
        />
      </div>

      <div className="tab-header-right">
        <button type="button" className="today-button" onClick={onToday}>
          <FaIcons.FaCalendarDay className="icon" />
          <span>今日</span>
        </button>

        <button type="button" className="arrow-button" onClick={onPrev}>
          <IoIosArrowBack />
        </button>

        <button type="button" className="arrow-button" onClick={onNext}>
          <IoIosArrowForward />
        </button>

        <div className="date-display">
          {formattedDate}
          <FaIcons.FaRegCalendarAlt className="date-icon" />
        </div>
      </div>
    </header>
  )
}
