import { LOGIN_URL_PREFIX } from "@/utils/constants"
import { fetch } from "@/utils/fetch"
/**
 * 获取登录url
 * @returns 
 */
const getLoginUrlApi = (): PromiseData<{
    qrcode_key: string
    url: string
}> => {
    return fetch({
        url: `${LOGIN_URL_PREFIX}/qrcode/generate`,
        method: 'GET',
    })
}

/**
 * 验证二维码是否被扫描
 * @param qrcode_key 二维码的key
 * @returns 
 */
const verifyQrCodeApi = (qrcode_key: string): PromiseData<ILogin> => {
    return fetch({
        url: `${LOGIN_URL_PREFIX}/qrcode/poll`,
        method: 'GET',
        params: {
            qrcode_key,
        },
    })
}

export {
    getLoginUrlApi,
    verifyQrCodeApi,
}