import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Button from '../../elements/Button';

type NavigationButtonProps = {
  direction: 'prev' | 'next';
  onClick: () => void;
};

const labels = {
  prev: '前の期間',
  next: '次の期間',
} as const;

// ナビゲーションボタン
function NavigationButton({ direction, onClick }: NavigationButtonProps) {
  const Icon = direction === 'prev' ? FaChevronLeft : FaChevronRight;

  return (
    <Button variant="ghost" onClick={onClick} aria-label={labels[direction]}>
      <Icon aria-hidden="true" />
    </Button>
  );
}

export default NavigationButton;

