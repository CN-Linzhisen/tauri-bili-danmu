import { emit, listen } from "@tauri-apps/api/event"

import type { UnlistenFn } from "@tauri-apps/api/event"
import { WEBSOCKET_URL } from "@/utils/constants"
import { CLOSE_WEBSOCKET_EVENT, CONNECT_SUCCESS_EVENT, OPEN_WEBSOCKET_EVENT, POPULARITY_EVENT } from "@/utils/events"
import { getLiveTokenApi } from "@/apis/live"
import { useAppStore } from "@/stores"
import { decode, encode } from "@/utils/tools"

let websocket: WebSocket | null
let timer = null as any
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const useWebsocket = () => {
    const { currentUser, room } = useAppStore()
    const messageEmits = async (messages: any[]) => {
        if (!messages || !Array.isArray(messages) || !messages.length) return
        console.log(messages)
        // const result = await handleMessage(messages)
        // if (!result) return


    }

    // 发送连接信息
    const onConnet = async (roomid: number) => {
        if (!websocket) return

        const { data } = await getLiveTokenApi(currentUser!, room)
        const authData = {
            uid: currentUser?.mid,
            roomid,
            protover: 2,
            type: 2,
            platform: "web",
            key: data?.token
        }

        websocket.send(encode(JSON.stringify(authData), 7))

        websocket.send(encode("", 2))

        timer = setInterval(() => {
            websocket && websocket.send(encode("", 2))
        }, 30000)
    }

    // 接收弹幕信息
    const onMessage = async (msgEvent: any) => {
        if (!websocket) return
        console.log("onMessage")
        if (websocket.readyState === 3) return websocket.close()
        console.log("111111");
        const result: any = await decode(msgEvent.data)

        switch (result.op) {
            case 3:
                await emit(POPULARITY_EVENT, result.body.count)
                break
            case 5:
                messageEmits(result.body)
                break
            case 8:
                await emit(CONNECT_SUCCESS_EVENT)
                break
            default:
                console.warn("没有捕获的op", result)
                break
        }
    }

    const closeWebsocket = () => {
        timer && clearInterval(timer)
        websocket && websocket?.close()
        websocket = null
    }

    const openWebsocket = (roomid: number) => {
        console.log("open websocket")
        if (websocket) {
            websocket.close();
        }

        websocket = new WebSocket(WEBSOCKET_URL)

        websocket.onopen = () => {
            websocket && websocket.readyState === WebSocket.OPEN && onConnet(roomid)
            console.log("websocket open")
        }

        websocket.onmessage = msgEvnt => onMessage(msgEvnt)

        websocket.onerror = () => {
            console.error("websocket error")
            openWebsocket(roomid)
        }
        websocket.onclose = (event) => {
            console.log("WebSocket 连接已关闭:", event.code, event.reason);

            // 如果不是用户主动关闭，尝试重连
            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                setTimeout(() => {
                    openWebsocket(roomid);
                }, 3000 * reconnectAttempts); // 递增延迟
            } else {
                console.log("达到最大重连次数，停止重连");
            }
        }
        console.log("websocket")
    }

    const unListeners: UnlistenFn[] = []
    const trigger = async () => {
        const startListener = await listen<string>(OPEN_WEBSOCKET_EVENT, (event) => {
            // closeWebsocket()

            const roomid = event.payload

            openWebsocket(Number.parseInt(roomid))
        })
        const stopListener = await listen(CLOSE_WEBSOCKET_EVENT, closeWebsocket)
        unListeners.push(startListener, stopListener)
    }

    return { trigger }
}

export default useWebsocket 