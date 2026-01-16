// React のエントリーポイント
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'ress/ress.css';
import './index.css';
import App from './App.tsx';

// アプリケーションをルート要素にマウント
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);