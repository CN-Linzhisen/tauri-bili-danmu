interface IUser {
    mid: number
    uname: string
    face: string
    cookie?: string
    csrf?: string
    medals: IUserMedal[]
    medalCount: number
    wbi_img: {
        img_url: string
        sub_url: string
    }
}

interface ILogin {
    url: string
    refresh_token: string
    timestamp: number
    code: 0 | 86038 | 86090 | 86101
    message: string
}


interface IAccess {
    uid: number
    cookie?: string
    csrf?: string
}

interface IRoom {
    roomid: number
    uname: string
}

interface IMsg {
    uid?: number
    id: string
    type: 'entry' | 'message' | 'message-banned' | 'gift' | 'like' | 'follow' | 'emoji' | 'config'
    isSafe?: boolean
    uname: string
    uface?: string
    message: string
    medal?: IUserMedal
    time?: number | string
}