import { useEffect, useState } from "react"
import { LoginState, QRCodeState } from "@/utils/enums"
import { getLoginUrlApi, verifyQrCodeApi } from "@/apis/bilibili";
import QRCode from "qrcode";
import QS from "qs";
import { useAppStore } from "@/stores";


const QRCodeLogin = () => {
    const [loginState, setLoginState] = useState<LoginState>(LoginState.未登录);
    const [qrCodeImage, setQrCodeImage] = useState<string>("");
    const { userList, setCurrentUser } = useAppStore();
    const getQRCode = async () => {
        try {
            const { data } = await getLoginUrlApi();
            if (!data) {
                setTimeout(() => { getQRCode }, 3000);
            }

            const { qrcode_key, url } = data;

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
        const { DedeUserId, bili_jct, SESSDATA } = QS.parse(url.split('?')[1]);
        const data: IAccess = {
            uid: +DedeUserId!.toString(),
            cookie: `SESSDATA=${SESSDATA}`,
            csrf: bili_jct!.toString(),
        }
        setUserInfo(data);
    }

    const setUserInfo = (access: IAccess) => {
        const target = userList.find(user => access.uid === user.mid);

        if (target) {
            Object.assign(target, access)
            // emits("success")
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
    }

    useEffect(() => {
        getQRCode();
    }, [])

    return (
        <div>
            {loginState === LoginState.已扫码} <h5>扫码成功</h5>
            {loginState === LoginState.已过期} <h5>二维码已过期，请重新获取</h5>
            {loginState === LoginState.扫码登录成功} <h5>登录成功</h5>
            {qrCodeImage && <img src={qrCodeImage} alt="二维码" />}
        </div>
    )
}

export default QRCodeLogin;