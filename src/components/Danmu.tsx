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
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">弹幕列表</h2>
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="输入弹幕内容..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white">
                    发送
                </Button>
            </div>
            <div className="border rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4">
                <div
                    ref={scrollRef}
                    className="h-96 overflow-y-auto space-y-3"
                >
                    {msgList.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                            暂无弹幕
                        </div>
                    ) : (
                        msgList.map((danmu, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                <Avatar className="h-10 w-10 shrink-0">
                                    <AvatarImage referrerPolicy="no-referrer" src={danmu.uface} />
                                    <AvatarFallback>{danmu.uname[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                                            {danmu.uname}
                                        </span>
                                        {danmu.medal && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                                style={{
                                                    background: `linear-gradient(to right, ${danmu.medal.medal_color_start}, ${danmu.medal.medal_color_end})`,
                                                    color: 'white'
                                                }}
                                            >
                                                {danmu.medal.medal_name} {danmu.medal.level}
                                            </Badge>
                                        )}
                                        {/* {danmu.isAnchor && (
                                            <Badge variant="default" className="text-xs bg-blue-600">主播</Badge>
                                        )}
                                        {danmu.isManager && (
                                            <Badge variant="default" className="text-xs bg-green-600">房管</Badge>
                                        )}
                                        {danmu.isGuard === 1 && (
                                            <Badge variant="default" className="text-xs bg-purple-600">总督</Badge>
                                        )}
                                        {danmu.isGuard === 2 && (
                                            <Badge variant="default" className="text-xs bg-blue-500">提督</Badge>
                                        )}
                                        {danmu.isGuard === 3 && (
                                            <Badge variant="default" className="text-xs bg-cyan-500">舰长</Badge>
                                        )} */}
                                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                                            {danmu.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 break-words">
                                        {danmu.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default Danmu