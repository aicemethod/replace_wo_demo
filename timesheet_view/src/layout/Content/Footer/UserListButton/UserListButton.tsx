import { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import Button from '../../../../components/elements/Button';
import UserListModal from '../UserListModal';

// ユーザー一覧設定ボタン
function UserListButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <FaUsers aria-hidden="true" />
        ユーザー一覧設定
      </Button>
      <UserListModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default UserListButton;


