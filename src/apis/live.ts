import { LIVE_URL_PREFIX } from "@/utils/constants"
import { fetch } from "@/utils/fetch"
import { getWbi } from "./wbi"
import { getBuvidApi } from "./bilibili"
import { EDMType } from "@/utils/enums"

const getLiveStatusApi = (room: number) => {
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

const getLiveTokenApi = async (currentUser: IUser, room: number) => {
    const params = {
        id: room
    }
    const wbi = await getWbi(params)

    const res = await getBuvidApi()
    if (!res || !res?.data!.b_3) return

    return fetch({
        url: `${LIVE_URL_PREFIX}/xlive/web-room/v1/index/getDanmuInfo${wbi}`,
        method: 'GET',
        headers: {
            cookie: `${currentUser?.cookie};buvid=${res.data.b_3}`
        }
    })
}

const sendMessageApi = (currentUser: IUser, roomid: number, message: string, type: EDMType, replyMid = 0) => {
    const data = {
        roomid: roomid,
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

    return fetch({
        url: `${LIVE_URL_PREFIX}/msg/send`,
        method: 'POST',
        data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}
export {
    getLiveStatusApi,
    getLiveTokenApi,
    sendMessageApi
}