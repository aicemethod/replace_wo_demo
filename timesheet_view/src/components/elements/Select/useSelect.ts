import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { SelectOption } from './Select';

type UseSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string, label: string | ReactNode) => void;
  noWrapper?: boolean;
};

export function useSelect({ options, value, onChange, noWrapper = false }: UseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [selectedLabel, setSelectedLabel] = useState<string | ReactNode>(
    options.find((opt) => opt.value === value)?.label || ''
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // 外部から value が変更された場合に状態を更新
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
      setSelectedLabel(options.find((opt) => opt.value === value)?.label || '');
    }
  }, [value, options]);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (noWrapper) {
        // noWrapperの場合、buttonとdropdownの両方をチェック
        const buttonContains = buttonRef.current?.contains(target);
        const dropdownContains = dropdownRef.current?.contains(target);
        if (!buttonContains && !dropdownContains) {
          setIsOpen(false);
        }
      } else {
        // 通常の場合、wrapperをチェック
        if (wrapperRef.current && !wrapperRef.current.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, noWrapper]);

  // オプション選択時の処理
  const handleSelect = (optionValue: string, optionLabel: string | ReactNode) => {
    setSelectedValue(optionValue);
    setSelectedLabel(optionLabel);
    setIsOpen(false);
    onChange?.(optionValue, optionLabel);
  };

  // ラベルの表示用テキストを取得
  const getLabelText = (label: string | ReactNode): string => {
    if (typeof label === 'string') return label;
    if (typeof label === 'number') return String(label);
    return '';
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return {
    isOpen,
    selectedValue,
    selectedLabel,
    dropdownRef,
    buttonRef,
    wrapperRef,
    handleSelect,
    getLabelText,
    toggleOpen,
  };
}
