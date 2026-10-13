import Header from './components/Header';
import Home from './components/Home';
function App() {
  return (
    <>
      <Header />
      <Home />
    </>
  );
}

export default App;

// App собирает страницу из компонентов: Header показывает заголовок, Home — список постов.
// Фрагмент <>...</> объединяет соседние компоненты без дополнительного элемента в DOM.
// Сам App данные не загружает: запрос к API и состояние списка находятся в Home.
// export default позволяет импортировать App в main.jsx, где React выводит его в #root.
