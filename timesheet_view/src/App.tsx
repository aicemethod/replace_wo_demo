import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './languages/i18n';
import './App.css';
import Header from './layout/Header/Header';
import Content from './layout/Content/Content';

// React Query のクライアントインスタンス
const queryClient = new QueryClient();

// メインアプリケーションコンポーネント
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Header />
        <Content />
      </div>
    </QueryClientProvider>
  );
}

export default App;