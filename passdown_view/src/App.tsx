import { getAppLocaleFromXrm } from './i18n';
import FileTable from './components/FileTable';
import './App.css';

function App() {
  const locale = getAppLocaleFromXrm();

  return (
    <div className="app">
      <main className="app-main">
        <FileTable locale={locale} />
      </main>
    </div>
  );
}

export default App;
