import { getLiveStatusApi } from "@/apis/live";
import { useAppStore } from "@/stores";
import { useState } from "react";
import { BARRAGE_MESSAGE_EVENT, CLOSE_WEBSOCKET_EVENT, CONNECT_SUCCESS_EVENT, OPEN_WEBSOCKET_EVENT, WELCOME_EVENT } from "./events";
import { emit, listen, once, UnlistenFn } from "@tauri-apps/api/event";

const useRoomState = () => {
    const [connected, setConnected] = useState(false);
    const { room, setRoom, addRoom, roomList, msgList, addMsg, clearMsg } = useAppStore();
    const unlisteners: UnlistenFn[] = []

    const init_listener = async () => {
        unlisteners.forEach(unlistener => unlistener());
        unlisteners.length = 0;

        const entryListener = await listen(WELCOME_EVENT, (event) => {
            const data = event.payload as object[];
            data.forEach(async (item: any) => {
                if (item.msg_type === "follow") {
                    addMsg({
                        type: 'follow',
                        uname: item.uname,
                        message: `${item.uname} 关注了主播`,
                        id: item.id,
                        medal: item.medal
                    })
                } else if (item.msg_type === 'entry') {
                    addMsg({
                        type: 'entry',
                        uname: item.uname,
                        message: `${item.uname} 进入了直播间`,
                        id: item.id,
                        medal: item.medal
                    })
                }
            })
        })
        unlisteners.push(entryListener)

        // 监听弹幕
        const danmuListener = await listen(BARRAGE_MESSAGE_EVENT, (event) => {
            const data = event.payload as object[];
            data.forEach(async (item: any) => {
                const { uname, message, isEmoji, emoji, medal, uface, time, isManager, uid, isAnchor, isSafe } = item.barrage;

                const msg = {
                    uid,
                    uname,
                    uface: `${uface}@300w_330h_1c.avif`,
                    message: isEmoji ? emoji.url : message,
                    isSafe,
                    type: isEmoji ? emoji.url : 'message',
                    id: item.id,
                    medal,
                    time,
                    isManager,
                    isAnchor
                }

                if (message) {
                    addMsg(msg);
                }

                // 排队弹幕
                if (message.startsWith('排队')) {
                    console.log("排队弹幕");
                }
            })
        })
        unlisteners.push(danmuListener)
    }
    const startWebsocket = async () => {
        const { data } = await getLiveStatusApi(room);
        console.log(data);
        const roomid = Object.keys(data.by_room_ids)[0];
        const info: IRoom = {
            roomid: +data.by_room_ids[`${roomid}`].room_id,
            uname: data.by_room_ids[`${roomid}`].uname,
        }
        console.log(info);
        setRoom(info.roomid);
        // 
        if (roomList.find(item => item.roomid === info.roomid) == null) {
            addRoom(info);
        }

        emit(OPEN_WEBSOCKET_EVENT, `${roomid}`)
        once(CONNECT_SUCCESS_EVENT, () => {
            console.log('连接成功');
            console.log('开启监听')
            clearMsg();
            setConnected(true);
            init_listener();
        })
    }

    const stopWebsocket = () => {
        setConnected(false);
        emit(CLOSE_WEBSOCKET_EVENT)
        unlisteners.forEach(unlistener => unlistener())
        unlisteners.length = 0;
        // const { stop } = useSpeechStore();
        // stop();
    }
    return {
        connected,
        setConnected,
        startWebsocket,
        stopWebsocket
    }
}

export default useRoomState;