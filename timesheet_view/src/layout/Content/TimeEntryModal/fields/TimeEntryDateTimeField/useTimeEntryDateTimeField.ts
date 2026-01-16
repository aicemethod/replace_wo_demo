import { useMemo } from 'react';
import type { SelectOption } from '../../../../../components/elements/Select';

export const hours = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0'));
export const minutes = Array.from({ length: 60 }, (_, index) => index.toString().padStart(2, '0'));

export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;

type UseTimeEntryDateTimeFieldProps = {
  value: Date;
  onChange: (nextValue: Date) => void;
};

export function useTimeEntryDateTimeField({ value, onChange }: UseTimeEntryDateTimeFieldProps) {
  // 文字列配列をSelectOption[]に変換
  const hourOptions: SelectOption[] = useMemo(
    () => hours.map((hour) => ({ value: hour, label: hour })),
    [],
  );
  const minuteOptions: SelectOption[] = useMemo(
    () => minutes.map((minute) => ({ value: minute, label: minute })),
    [],
  );

  const currentHour = value.getHours().toString().padStart(2, '0');
  const currentMinute = value.getMinutes().toString().padStart(2, '0');

  const handleHourChange = (hour: string) => {
    const next = new Date(value);
    next.setHours(Number(hour));
    onChange(next);
  };

  const handleMinuteChange = (minute: string) => {
    const next = new Date(value);
    next.setMinutes(Number(minute));
    onChange(next);
  };

  return {
    hourOptions,
    minuteOptions,
    currentHour,
    currentMinute,
    handleHourChange,
    handleMinuteChange,
  };
}
