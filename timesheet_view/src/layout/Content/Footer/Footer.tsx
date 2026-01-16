import UserListButton from './UserListButton/UserListButton';
import FavoriteTaskButton from './FavoriteTaskButton/FavoriteTaskButton';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-actions">
        <UserListButton />
        <FavoriteTaskButton />
      </div>
    </footer>
  );
}

export default Footer;


