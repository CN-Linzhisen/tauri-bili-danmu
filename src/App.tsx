import "./App.css";
import "tailwindcss";
import Account from "./components/Account";
import Control from "./components/Control";
import { useEffect } from "react";
import useWebsocket from "./hooks/useWebsocket";
import Danmu from "./components/Danmu";
import { useAppStore } from "./stores";
/**
 * App组件，作为应用程序的主入口
 * 使用React和Tauri进行交互
 */
function App() {
  const { trigger } = useWebsocket();
  const { refreshCurrentUser } = useAppStore();
  useEffect(() => {
    console.log(Date.now())
    trigger()
    refreshCurrentUser()
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
