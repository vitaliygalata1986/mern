import { createContext } from 'react';
import { useState } from 'react';

// Контекст передаёт общий список и его setter компонентам внутри PostProvider.
// Значение по умолчанию не задано: потребителям нужен провайдер выше по дереву.
export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  // Единственное состояние списка для текущего экземпляра провайдера.
  const [posts, setPosts] = useState([]);
  return (
    <PostContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostContext.Provider>
  );
};

// PostContext описывает канал передачи данных, а состояние хранит PostProvider.
// В main.jsx провайдер оборачивает App, поэтому Home и вложенный PostForm
// получают одни и те же posts и setPosts через useContext(PostContext).
// children — вложенное дерево компонентов; здесь в него передаётся <App />.
// value={{ posts, setPosts }} делает оба значения доступными потребителям.
// При изменении posts провайдер рендерится снова, передаёт новое value
// и React обновляет компоненты, которые читают этот контекст.
//
// Сам провайдер не обращается к API: Home загружает начальный список,
// а PostForm добавляет сохранённый сервером пост функциональным вызовом setPosts.
// Контекст хранит данные только в памяти: после перезагрузки страницы posts
// снова равен [], затем Home запрашивает сохранённые записи из MongoDB через API.
// Экспорт контекста вместе с компонентом в этом файле сейчас вызывает замечание
// правила ESLint react-refresh/only-export-components о границе Fast Refresh.
