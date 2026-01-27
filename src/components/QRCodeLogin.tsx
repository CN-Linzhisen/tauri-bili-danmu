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
        <div className="flex flex-col items-center justify-center bg-pink-200 w-40 h-40 mx-auto p-4">
            {loginState === LoginState.已扫码 && <h5 className="text-green-600 mb-2">扫码成功</h5>}
            {loginState === LoginState.已过期 && <h5 className="text-red-600 mb-2">二维码已过期，请重新获取
                <button
                    type="button"
                    onClick={() => getQRCode()}
                    className="ml-2 text-blue-500 underline hover:text-blue-700"
                >
                    点击刷新
                </button>
            </h5>}
            {loginState === LoginState.扫码登录成功 && <h5 className="text-blue-600 mb-2">登录成功</h5>}
            {loginState === LoginState.未登录 && qrCodeImage && (
                <img
                    src={qrCodeImage}
                    alt="二维码"
                    className="max-w-full max-h-32 object-contain"
                />
            )}
        </div>
    )
}

export default QRCodeLogin;