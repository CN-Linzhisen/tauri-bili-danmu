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
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">弹幕监听器</h1>
          <Account />
        </div>

        {/* 主要内容区域 - 左右分栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-6">
              <Control />
            </div>
          </div>

          {/* 右侧弹幕列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <Danmu />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
