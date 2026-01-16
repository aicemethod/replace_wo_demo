import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaSortAmountDown } from 'react-icons/fa';
import './UserSortingSelect.css';
import type { UserSortingOption } from '../../../../types/user';

export type UserSortingSelectProps = {
  value: string;
  options: UserSortingOption[];
  onChange: (value: string) => void;
};

// ユーザーソート選択コンポーネント
function UserSortingSelect({ value, options, onChange }: UserSortingSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="user-sorting-select" ref={dropdownRef}>
      <button
        type="button"
        className={`user-sorting-select-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FaChevronDown
          className={`user-sorting-select-icon left ${isOpen ? 'open' : ''}`}
          size={12}
        />
        <span className="user-sorting-select-text">{currentOption?.label ?? ''}</span>
        <FaSortAmountDown className="user-sorting-select-icon right" size={14} />
      </button>
      <div className={`user-sorting-select-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="user-sorting-select-options">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`user-sorting-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserSortingSelect;

