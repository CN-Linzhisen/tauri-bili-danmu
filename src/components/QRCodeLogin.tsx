import { useEffect, useState } from "react"
import { LoginState, QRCodeState } from "@/utils/enums"
import { getLoginUrlApi, verifyQrCodeApi } from "@/apis/bilibili";
import QRCode from "qrcode";
import QS from "qs";
import { useAppStore } from "@/stores";


const QRCodeLogin = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [loginState, setLoginState] = useState<LoginState>(LoginState.未登录);
    const [qrCodeImage, setQrCodeImage] = useState<string>("");
    const { userList, setCurrentUser } = useAppStore();
    const getQRCode = async () => {
        setLoginState(LoginState.未登录);
        try {
            const { data } = await getLoginUrlApi();
            if (!data) {
                setTimeout(() => { getQRCode }, 3000);
            }

            const { qrcode_key, url } = data;
            console.log("二维码链接: ", url);
            console.log("二维码key: ", qrcode_key);
            setQrCodeImage(await QRCode.toDataURL(url));
            verifyQrCode(qrcode_key);
        } catch (error) {
            console.error("获取二维码失败: ", error)
            setTimeout(() => {
                setLoginState(LoginState.未登录);
            }, 3000);
        }
    }

    const verifyQrCode = async (qrcode_key: string) => {
        const { data } = await verifyQrCodeApi(qrcode_key);
        console.log("二维码状态: ", data);
        if (!data) {
            setTimeout(() => {
                verifyQrCode(qrcode_key);
            }, 3000);
            return;
        }

        switch (data.code) {
            case QRCodeState.已失效:
                setLoginState(LoginState.已过期);
                break;
            case QRCodeState.未扫码:
                setTimeout(() => {
                    verifyQrCode(qrcode_key);
                }, 3000);
                break;
            case QRCodeState.已扫码未确认:
                setLoginState(LoginState.已扫码);
                setTimeout(() => {
                    verifyQrCode(qrcode_key);
                }, 3000);
                break;
            case QRCodeState.成功登陆:
                setLoginState(LoginState.扫码登录成功);
                // 保存登录信息
                saveLoginInfo(data.url);
                break;
        }
    }

    const saveLoginInfo = (url: string) => {
        const { DedeUserID, bili_jct, SESSDATA } = QS.parse(url.split('?')[1]);

        const data: IAccess = {
            uid: +DedeUserID!.toString(),
            cookie: `SESSDATA=${SESSDATA}`,
            csrf: bili_jct!.toString(),
        }
        console.log("登录信息: ", data);
        setUserInfo(data);
    }

    const setUserInfo = async (access: IAccess) => {
        const target = userList.find(user => access.uid === user.mid);

        if (target) {
            console.log("Found existing user:", target);
            Object.assign(target, access)
            setCurrentUser(target);
            setQrCodeImage("");
            setLoginState(LoginState.未登录);
            onSuccess && onSuccess();
            return
        }

        const user: IUser = {
            uname: "新用户",
            mid: access.uid,
            face: "",
            csrf: access.csrf,
            cookie: access.cookie,
            medals: [],
            medalCount: 0,
            wbi_img: {
                img_url: "",
                sub_url: "",
            },
        }

        userList.unshift(user);
        setCurrentUser(user);
        setQrCodeImage("");
        setLoginState(LoginState.未登录);
        onSuccess && onSuccess();
    }

    useEffect(() => {
        getQRCode();
    }, [])

    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative group">
            {/* 状态遮罩层 */}
            {(loginState === LoginState.已扫码 || loginState === LoginState.扫码登录成功 || loginState === LoginState.已过期) && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg transition-all duration-300">
                    {loginState === LoginState.已扫码 && (
                        <>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-200">扫描成功</h5>
                            <p className="text-xs text-slate-500 mt-1">请在手机上确认登录</p>
                        </>
                    )}
                    
                    {loginState === LoginState.已过期 && (
                        <>
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-200">二维码已过期</h5>
                            <button
                                type="button"
                                onClick={() => getQRCode()}
                                className="mt-2 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
                            >
                                刷新二维码
                            </button>
                        </>
                    )}

                    {loginState === LoginState.扫码登录成功 && (
                        <>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h5 className="text-sm font-medium text-slate-700 dark:text-slate-200">登录成功!</h5>
                        </>
                    )}
                </div>
            )}

            {/* 二维码显示区 */}
            <div className="relative p-2 bg-white rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                {qrCodeImage ? (
                    <img
                        src={qrCodeImage}
                        alt="登录二维码"
                        className="w-32 h-32 object-contain rounded-md"
                    />
                ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-md">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">打开 Bilibili 手机端扫码登录</p>
        </div>
    )
}

export default QRCodeLogin;