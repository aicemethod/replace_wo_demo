import TargetWorkOrderSelect from './TargetWorkOrderSelect';
import './Header.css';

// アプリケーションのヘッダーコンポーネント
function Header() {
  return (
    <header className="header">
      <h1 className="header-title">TimeSheet</h1>
      <div className="header-right">
        <label className="wo-label">対象WO</label>
        <TargetWorkOrderSelect />
      </div>
    </header>
  );
}

export default Header;