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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">弹幕监听器</h1>
          <Account />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-1">
            <Control />
          </div>
          <div className="lg:col-span-2">
            <Danmu />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;