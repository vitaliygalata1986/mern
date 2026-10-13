import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { PostProvider } from './context/PostContext.jsx';

// Провайдер стоит над App и делает состояние постов общим для его потомков.
createRoot(document.getElementById('root')).render(
  <PostProvider>
    <App />
  </PostProvider>,
);

// createRoot связывает React с контейнером #root из front/index.html.
// index.css подключает общие стили страницы, списка и формы.
// Дерево приложения: PostProvider → App → Header и Home → PostForm/PostDetail.
// StrictMode импортирован, но в JSX не используется: эта обёртка сейчас выключена.
// Неиспользуемый импорт остаётся причиной замечания ESLint no-unused-vars.
