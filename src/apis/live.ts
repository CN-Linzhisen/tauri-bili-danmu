import { LIVE_URL_PREFIX } from "@/utils/constants"
import { fetch } from "@/utils/fetch"
import { getWbi } from "./wbi"
import { getBuvidApi } from "./bilibili"
import { EDMType } from "@/utils/enums"
import { useAppStore } from '@/stores/index'

const getLiveStatusApi = () => {
    const { room } = useAppStore.getState();
    console.log('getLiveStatusApi', room)
    return fetch({
        url: `${LIVE_URL_PREFIX}/xlive/web-room/v1/index/getRoomBaseInfo`,
        method: 'GET',
        params: {
            room_ids: room,
            req_biz: 'link-center'
        }
    })
}

const getLiveTokenApi = async () => {
    const { currentUser, room } = useAppStore.getState();
    console.log('getLiveTokenApi', room)
    console.log(currentUser?.cookie);
    const params = {
        id: room
    }
    const wbi = await getWbi(params)

    const res = await getBuvidApi()
    if (!res || !res?.data?.b_3) return
    console.log("live: ", res.data.b_3, wbi, currentUser?.cookie)
    return fetch({
        url: `${LIVE_URL_PREFIX}/xlive/web-room/v1/index/getDanmuInfo?${wbi}`,
        method: 'GET',
        headers: {
            cookie: `${currentUser?.cookie};buvid3=${res.data.b_3}`,
        },
    })
}

const sendMessageApi = (message: string, type: EDMType, replyMid = 0) => {
    const { currentUser, room } = useAppStore.getState();
    const data = {
        roomid: `${room}`,
        msg: message,
        dm_type: type === EDMType.打卡专用 ? '0' : type,
        bubble: '0',
        isInitiative: type === EDMType.表情弹幕 ? true : '',
        color: '16777215',
        mode: '1',
        fontsize: '25',
        rnd: Math.floor(Date.now() / 1000).toString(),
        reply_mid: `${replyMid}`,
        reply_attr: '0',
        csrf: currentUser?.csrf,
        csrf_token: currentUser?.csrf
    }
    console.log('发送弹幕数据:', data);
    return fetch({
        url: `${LIVE_URL_PREFIX}/msg/send`,
        method: 'POST',
        data,
        headers: {
            'cookie': currentUser?.cookie,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}


export {
    getLiveStatusApi,
    getLiveTokenApi,
    sendMessageApi
}