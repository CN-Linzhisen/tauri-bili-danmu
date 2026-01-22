import "./App.css";
import "tailwindcss";
import Account from "./components/Account";
import Control from "./components/Control";
import { useEffect } from "react";
import useWebsocket from "./hooks/useWebsocket";
import Danmu from "./components/Danmu";
/**
 * App组件，作为应用程序的主入口
 * 使用React和Tauri进行交互
 */
function App() {
  const { trigger } = useWebsocket();
  useEffect(() => {
    trigger
  }, []);
  return (
    <main>
      {/* <QRCodeLogin /> */}
      {/* <button onClick={getUserInfo}>获取用户信息</button> */}
      <Account />
      <Control />
      <Danmu />
    </main>
  );


}

export default App;
