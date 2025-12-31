import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import QRCodeLogin from "@/components/QRCodeLogin";
import "tailwindcss";
/**
 * App组件，作为应用程序的主入口
 * 使用React和Tauri进行交互
 */
function App() {
  // 使用React的useState钩子管理问候消息和名称状态
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  /**
   * 异步函数，用于调用Tauri的greet命令
   * 通过invoke方法与后端Rust代码进行通信
   */
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
      <QRCodeLogin />
    </main>
  );
}

export default App;
