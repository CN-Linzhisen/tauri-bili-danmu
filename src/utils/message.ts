import { useAppStore } from '@/stores'
import DOMPurify from 'dompurify'
import { nanoid } from 'nanoid'
import { colorHexToRgba } from './tools';
import { MESSAGE_TYPE } from './constants';

// 格式化时间为 HH:mm:ss
const formatTime = (date: Date = new Date()) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

const handleMessage = async (messages: any[]) => {
    const barrageList: any[] = []

    const parseDanmu = async (message: any) => {
        const { info } = message

        const id = nanoid()

        const { currentUser } = useAppStore.getState();

        const up_id = currentUser?.mid

        const originMsg = info[1]
        const sanitizedMsg = DOMPurify.sanitize(originMsg)
        const isSafe = sanitizedMsg.length

        const barrageInfo = {
            uid: info[2][0],
            uname: info[2][1],
            uface: info[0][15].user.base.face,
            message: isSafe ? sanitizedMsg : originMsg,
            isSafe, // 是否安全，XSS过滤
            isAnchor: +info[2][0] === up_id, // 是否主播本人
            isManager: !!info[2][2], // 房管
            isGuard: info[7], // 舰队成员，1-总督，2-提督，3-舰长
            isEmoji: !!info[0][12], // 弹幕类型，0-文字，1-emoji
            emoji: info[0][13],
            unameColor: info[2][7],
            medal: info[3].length
                ? {
                    level: info[3][0],
                    medal_name: info[3][1],
                    medal_color_start: info[3][8],
                    medal_color_end: info[3][7],
                    medal_color_border: info[3][9],
                    room_id: info[3][3],
                    is_lighted: !!info[3][11],
                }
                : undefined,
            backgroundColor: '',
            time: formatTime()
        }

        const nameColor = barrageInfo.unameColor

        if (nameColor) {
            barrageInfo.backgroundColor = colorHexToRgba(nameColor, 0.3) as string
        }
        const extra = JSON.parse(info[0][15].extra)

        // 替换emoji表情
        if (extra.emots) {
            for (const key in extra.emots) {
                const reg = new RegExp(key.replace('[', '\\[').replace(']', '\\]'), 'gi')
                barrageInfo.message = barrageInfo.message.replaceAll(reg, `<img style="width: 20px; height: 20px;" src="${extra.emots[key].url}" />`)
            }
        }

        barrageList.push({
            id,
            barrage: barrageInfo,
            barrageType: 'general',
        })
    }

    const messageFormatter = async (message: any) => {
        const { cmd } = message
        switch (cmd) {
            case MESSAGE_TYPE.DANMU:
                await parseDanmu(message)
                break;
        }
    }

    for (const message of messages) {
        await messageFormatter(message)
    }

    return {
        barrageList,

    }
}

export default handleMessage