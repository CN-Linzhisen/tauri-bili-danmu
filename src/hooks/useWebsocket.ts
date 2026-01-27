import { emit, listen } from "@tauri-apps/api/event"

import type { UnlistenFn } from "@tauri-apps/api/event"
import { WEBSOCKET_URL } from "@/utils/constants"
import { BARRAGE_MESSAGE_EVENT, CLOSE_WEBSOCKET_EVENT, CONNECT_SUCCESS_EVENT, OPEN_WEBSOCKET_EVENT, POPULARITY_EVENT } from "@/utils/events"
import { getLiveTokenApi } from "@/apis/live"
import { useAppStore } from "@/stores"
import { decode, encode } from "@/utils/tools"
import handleMessage from "@/utils/message"

let websocket: WebSocket | null
let timer = null as any
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

const useWebsocket = () => {
    const { currentUser, room } = useAppStore.getState();

    const messageEmits = async (messages: any[]) => {
        if (!messages || !Array.isArray(messages) || !messages.length) return
        console.log(messages)

        const result = await handleMessage(messages)
        if (!result) return

        const { barrageList } = result

        if (barrageList && barrageList.length) {
            emit(BARRAGE_MESSAGE_EVENT, barrageList)
        }
    }

    // 发送连接信息
    const onConnet = async (roomid: number) => {
        if (!websocket) {
            console.log("WebSocket not ready, skipping authentication");
            return;
        }

        try {
            const { data } = await getLiveTokenApi()
            const authData = {
                uid: currentUser?.mid,
                roomid,
                protover: 2,
                type: 2,
                platform: "web",
                key: data?.token
            }
            console.log("Sending auth data:", authData)
            websocket.send(encode(JSON.stringify(authData), 7))

            websocket.send(encode("", 2))

            timer = setInterval(() => {
                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.send(encode("", 2))
                }
            }, 30000)
        } catch (error) {
            console.error("Failed to authenticate:", error);
        }
    }

    // 接收弹幕信息
    const onMessage = async (msgEvent: any) => {
        if (!websocket) return

        // 检查是否连接仍然有效
        if (websocket.readyState === WebSocket.CLOSING || websocket.readyState === WebSocket.CLOSED) {
            console.log("Received message but socket is closing/closed");
            return;
        }

        console.log("onMessage")
        const result: any = await decode(msgEvent.data)

        switch (result.op) {
            case 3:
                await emit(POPULARITY_EVENT, result.body.count)
                break
            case 5:
                messageEmits(result.body)
                break
            case 8:
                console.log("Authentication successful");
                await emit(CONNECT_SUCCESS_EVENT)
                break
            default:
                console.warn("没有捕获的op", result)
                break
        }
    }

    const closeWebsocket = () => {
        console.log("Closing websocket");
        timer && clearInterval(timer)
        if (websocket) {
            websocket.close(1000, "Normal closure by user request");
            websocket = null;
        }
        reconnectAttempts = 0;
    }

    const openWebsocket = (roomid: number) => {
        console.log("Opening websocket connection to", WEBSOCKET_URL);

        // 如果已有连接，先关闭
        if (websocket) {
            console.log("Closing existing connection");
            websocket.close();
            websocket = null;
        }

        // 创建新连接
        websocket = new WebSocket(WEBSOCKET_URL)

        websocket.onopen = () => {
            console.log("WebSocket connection opened");
            reconnectAttempts = 0; // 重置重连计数

            // 确保连接状态为OPEN后再发送认证
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                console.log("Connection established, sending auth data");
                onConnet(roomid);
            } else {
                console.log("Connection not ready after open event, current state:", websocket?.readyState);
            }
        }

        websocket.onmessage = (msgEvent) => {
            // 只有在连接状态下才处理消息
            if (websocket && (websocket.readyState === WebSocket.OPEN)) {
                onMessage(msgEvent);
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            // 不在这里立即重连，让onclose处理重连逻辑
        }

        websocket.onclose = (event) => {
            console.log("WebSocket 连接已关闭:", event.code, event.reason);

            // 清除定时器
            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            // 如果不是用户主动关闭（代码1000）且未超出最大重连次数，则尝试重连
            if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(`尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

                setTimeout(() => {
                    openWebsocket(roomid);
                }, 3000 * reconnectAttempts); // 递增延迟
            } else {
                console.log("WebSocket 连接已断开，不再重连");
            }
        }

        console.log("WebSocket initialized");
    }

    const unListeners: UnlistenFn[] = []
    const trigger = async () => {
        console.log("useWebsocket trigger called");
        const startListener = await listen<string>(OPEN_WEBSOCKET_EVENT, async (event) => {
            console.log("Received OPEN_WEBSOCKET_EVENT with roomid:", event.payload);
            closeWebsocket()

            const roomid = event.payload
            console.log(roomid)
            openWebsocket(Number.parseInt(roomid))
        })
        const stopListener = await listen(CLOSE_WEBSOCKET_EVENT, closeWebsocket)
        unListeners.push(startListener, stopListener)
        console.log("WebSocket listeners registered");
    }

    return { trigger }
}

export default useWebsocket