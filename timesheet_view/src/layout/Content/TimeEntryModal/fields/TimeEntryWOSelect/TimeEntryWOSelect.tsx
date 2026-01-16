import Select, { type SelectOption } from '../../../../../components/elements/Select';

type TimeEntryWOSelectProps = {
  options: SelectOption[];
  placeholder?: string;
};

// WO選択コンポーネント
function TimeEntryWOSelect({ options, placeholder = 'WO番号を選択' }: TimeEntryWOSelectProps) {
  return <Select options={options} placeholder={placeholder} className="time-entry-wo-select" />;
}

export type { SelectOption as TimeEntryWOOption };
export default TimeEntryWOSelect;

