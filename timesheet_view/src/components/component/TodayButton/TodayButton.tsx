import { FaCalendarAlt } from 'react-icons/fa';
import Button from '../../elements/Button';

type TodayButtonProps = {
  onClick: () => void;
};

// 今日ボタン
function TodayButton({ onClick }: TodayButtonProps) {
  return (
    <Button variant="ghost" onClick={onClick}>
      <FaCalendarAlt />
      今日
    </Button>
  );
}

export default TodayButton;

