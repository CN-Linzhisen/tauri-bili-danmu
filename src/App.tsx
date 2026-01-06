import "./App.css";
import "tailwindcss";
import Account from "./components/Account";
/**
 * App组件，作为应用程序的主入口
 * 使用React和Tauri进行交互
 */
function App() {

  return (
    <main className="container">
      {/* <QRCodeLogin /> */}
      {/* <button onClick={getUserInfo}>获取用户信息</button> */}
      <Account />
    </main>
  );
}

export default App;
