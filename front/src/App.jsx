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

// App собирает страницу: Header показывает заголовок, Home — форму и список постов.
// Фрагмент <>...</> объединяет соседние компоненты без дополнительного элемента в DOM.
// Сам App данные не загружает: GET-запрос выполняет Home, а состояние списка
// хранится в PostProvider, который оборачивает App в main.jsx.
// export default позволяет импортировать App в main.jsx, где React выводит его в #root.
