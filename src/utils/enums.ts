export enum LoginState {
    未登录 = 0,
    已扫码 = 1,
    已过期 = 2,
    扫码登录成功 = 3
}

export enum QRCodeState {
    成功登陆 = 0,
    已失效 = 86038,
    未扫码 = 86101,
    已扫码未确认 = 86090
}