import Select from '../../../components/elements/Select';
import { WORK_ORDER_OPTIONS } from '../../../constants/workOrders';

// 対象WO選択コンポーネント
function TargetWorkOrderSelect() {
  return (
    <Select
      options={WORK_ORDER_OPTIONS}
      placeholder="対象WOを選択"
      className="target-wo-select"
    />
  );
}

export default TargetWorkOrderSelect;