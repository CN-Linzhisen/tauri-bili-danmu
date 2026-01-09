import "./App.css";
import "tailwindcss";
import Account from "./components/Account";
import Control from "./components/Control";
import { useEffect } from "react";
import useWebsocket from "./hooks/useWebsocket";
import { emit } from "@tauri-apps/api/event";
import { CLOSE_WEBSOCKET_EVENT } from "./utils/events";
import Danmu from "./components/Danmu";
/**
 * App组件，作为应用程序的主入口
 * 使用React和Tauri进行交互
 */
function App() {
  const { trigger } = useWebsocket();

  useEffect(() => {
    // 相当于 Vue 的 onMounted
    console.log('App mounted - triggering websocket');
    trigger();

    // 如果你有 refreshCurrentUser 函数，也在这里调用
    // refreshCurrentUser();

    // 返回清理函数，相当于 Vue 的 onUnmounted
    return () => {
      console.log('App unmounting - cleaning up');
      // 发送关闭事件
      emit(CLOSE_WEBSOCKET_EVENT);
      // 如果 useWebsocket 有清理函数，也在这里调用
      // cleanupWebsocket();
    };
  }, [trigger]);
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
