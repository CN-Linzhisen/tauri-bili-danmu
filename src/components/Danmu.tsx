import { sendMessageApi } from "@/apis/live"
import { LOCAL_WEBSOCKET_URL } from "@/utils/constants"
import { EDMType } from "@/utils/enums"
import { useEffect, useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">弹幕列表</h2>

                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        placeholder="输入弹幕内容..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full sm:w-64 rounded-lg px-4 py-3"
                    />
                    <Button
                        onClick={handleSend}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
                    >
                        发送
                    </Button>
                </div>
            </div>

            <div className="border rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 shadow-sm">
                <ScrollArea className="h-125 pr-4">
                    <div ref={scrollRef} className="space-y-4">
                        {msgList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4 dark:bg-slate-700 dark:border-slate-600" />
                                <p className="text-slate-500 dark:text-slate-400 text-center">
                                    暂无弹幕<br />
                                    <span className="text-sm">开始接收直播间弹幕消息</span>
                                </p>
                            </div>
                        ) : (
                            msgList.map((danmu) => (
                                <div
                                    key={danmu.id}
                                    className="flex gap-3 p-3 rounded-lg bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                                >
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarImage
                                            referrerPolicy="no-referrer"
                                            src={danmu.uface}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/fallback-avatar.png';
                                            }}
                                        />
                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                                            {danmu.uname?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate max-w-30">
                                                {danmu.uname}
                                            </span>
                                            {danmu.medal && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs px-2 py-0.5"
                                                    style={{
                                                        background: `linear-gradient(to right, ${danmu.medal.medal_color_start}, ${danmu.medal.medal_color_end})`,
                                                        color: 'white'
                                                    }}
                                                >
                                                    {danmu.medal.medal_name} {danmu.medal.level}
                                                </Badge>
                                            )}
                                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto whitespace-nowrap">
                                                {danmu.time}
                                            </span>
                                        </div>
                                        <p className={`text-sm wrap-break-word ${danmu.type === 'message-banned' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {danmu.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

export default Danmu