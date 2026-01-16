import { useState } from 'react';
import { FaRegStar } from 'react-icons/fa';
import Button from '../../../../components/elements/Button';
import FavoriteTaskModal from '../FavoriteTaskModal';

// お気に入り間接タスクボタン
function FavoriteTaskButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <FaRegStar aria-hidden="true" />
        お気に入り間接タスク
      </Button>
      <FavoriteTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default FavoriteTaskButton;


