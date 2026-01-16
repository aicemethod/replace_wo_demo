import { FaPlus } from 'react-icons/fa';
import Button from '../../elements/Button';

type CreateEntryButtonProps = {
  onClick?: () => void;
};

// 新しいタイムエントリ作成ボタン
function CreateEntryButton({ onClick }: CreateEntryButtonProps) {
  return (
    <Button variant="primary" onClick={onClick}>
      <FaPlus />
      新しいタイムエントリを作成
    </Button>
  );
}

export default CreateEntryButton;

