import "./App.css";
import "tailwindcss";
import Account from "./components/Account";
import Control from "./components/Control";
import { useEffect } from "react";
import useWebsocket from "./hooks/useWebsocket";
import Danmu from "./components/Danmu";
import { useAppStore } from "./stores";
import { Tv } from "lucide-react";

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
    <main className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-normal animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 dark:bg-purple-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-normal animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-100/50 dark:bg-pink-900/10 blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-normal animate-blob animation-delay-4000"></div>
      </div>

      {/* 左侧侧边栏 */}
      <div className="w-[360px] shrink-0 flex flex-col gap-6 p-6 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl z-10 overflow-y-auto no-scrollbar">
        {/* 顶部 Header */}
        <header className="flex items-center gap-3 shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 text-white">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
              BiliDanmu
            </h1>
            <p className="text-xs text-slate-500 font-medium">直播弹幕监听助手</p>
          </div>
        </header>

        {/* Account */}
        <div className="shrink-0">
          <Account />
        </div>

        {/* Control */}
        <div className="shrink-0">
          <Control />
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 h-full min-h-0 relative z-0 p-6">
        <Danmu />
      </div>
    </main>
  );
}

export default App;
