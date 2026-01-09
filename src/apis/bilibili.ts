import { BASE_URL_PREFIX, LOGIN_URL_PREFIX } from "@/utils/constants"
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

/**
 * 获取用户信息
 * @returns 
 */
const getUserInfoApi = (): PromiseData<IUser> => {
    return fetch({
        url: `${BASE_URL_PREFIX}/x/web-interface/nav`,
    })
}

/**
 * 
 * @returns 
 */
const getBuvidApi = (): PromiseData<{ b_3: string, b_4: string }> => {
    return fetch({
        url: `${BASE_URL_PREFIX}/x/frontend/finger/spi`,
    })
}
export {
    getLoginUrlApi,
    verifyQrCodeApi,
    getUserInfoApi,
    getBuvidApi,
}