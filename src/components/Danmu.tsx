import { sendMessageApi } from "@/apis/live"
import { LOCAL_WEBSOCKET_URL } from "@/utils/constants"
import { EDMType } from "@/utils/enums"
import { useEffect, useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { useAppStore } from "@/stores"
import { nanoid } from "nanoid"

let ws: WebSocket
const Danmu = () => {
    const [message, setMessage] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const { currentUser, msgList, addMsg } = useAppStore()
    const init_listener = () => {
        ws = new WebSocket(LOCAL_WEBSOCKET_URL)

        ws.onopen = () => {
            ws.send('sync-config')
            setInterval(() => {
                ws.send('client-ping')
            }, 30 * 1000)
        }

        ws.onmessage = (e) => {
            console.log("Danmu WebSocket Message Event:", e);
            if (typeof e.data != 'string') return
            console.log("收到消息 Danmu")
            console.log(e)
            console.log(e.data)
            try {
                const data = JSON.parse(e.data)

                if (data.type !== 'danmu') return

                const command = data.command as SocketDanmuCommand
                const msg = data.data as any
                console.log("command: ", command)
                switch (command) {
                    case 'send':
                        break
                    case 'clear':
                        break
                }
                console.log("data: ", data)
                console.log("command: ", command)
                console.log("msg: ", msg)
            }
            catch (e) {
                console.log(e)
            }
        }

        ws.onerror = (e) => {
            console.error(e)
        }
    }

    const handleSend = async () => {
        if (!message.trim()) return;
        const res = await sendMessageApi(message, EDMType.普通弹幕, 0)
        console.log(res)
        // 含有屏蔽词, 添加到弹幕列表，但是划线显示
        if (res.msg === 'f' || res.message === 'f') {
            addMsg({
                uid: currentUser?.mid || 0,
                id: nanoid(),
                type: 'message-banned',
                uname: currentUser?.uname || '',
                uface: currentUser?.face || '',
                message: message,
                medal: undefined,
            })
        }
        setMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend()
        }
    }

    useEffect(() => {
        console.log("Danmu init_listener")
        init_listener()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [msgList])

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">实时弹幕</h2>
                    <Badge variant="outline" className="ml-2 text-xs font-normal text-slate-500">
                        {msgList.length} 条
                    </Badge>
                </div>
            </div>

            <div className="flex-1 min-h-0 border rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto no-scrollbar">
                    <div className="space-y-2 pb-4">
                        {msgList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium">等待弹幕连接...</p>
                            </div>
                        ) : (
                            msgList.map((danmu) => (
                                <div
                                    key={danmu.id}
                                    className="group flex gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                >
                                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm mt-0.5">
                                        <AvatarImage
                                            referrerPolicy="no-referrer"
                                            src={danmu.uface?.replace('http:', 'https:')}
                                            className="object-cover"
                                            onError={(e) => {
                                                console.warn(`Avatar load failed for ${danmu.uname}: ${danmu.uface}`);
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/default-avatar.svg';
                                                target.onerror = null;
                                            }}
                                        />
                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-xs">
                                            {danmu.uname?.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                                                {danmu.uname}
                                            </span>
                                            {danmu.medal && (
                                                <Badge
                                                    variant="secondary"
                                                    className="h-4 px-1 text-[10px] font-normal rounded-sm border-0"
                                                    style={{
                                                        background: `linear-gradient(90deg, ${danmu.medal.medal_color_start}, ${danmu.medal.medal_color_end})`,
                                                        color: 'white'
                                                    }}
                                                >
                                                    {danmu.medal.medal_name} {danmu.medal.level}
                                                </Badge>
                                            )}
                                            <span className="text-[10px] text-slate-300 dark:text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                {danmu.time}
                                            </span>
                                        </div>
                                        <div className={`text-sm leading-relaxed break-all ${danmu.type === 'message-banned' ? 'line-through text-slate-400 italic' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {danmu.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="发送弹幕参与互动..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-offset-0"
                        />
                        <Button
                            onClick={handleSend}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0"
                            size="default"
                        >
                            发送
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Danmu