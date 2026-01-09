import { LOCAL_WEBSOCKET_URL } from "@/utils/constants"
import { useEffect } from "react"

const Danmu = () => {
    let ws: WebSocket
    const init_listener = () => {
        ws = new WebSocket(LOCAL_WEBSOCKET_URL)

        ws.onopen = () => {
            ws.send('sync-config')
            setInterval(() => {
                ws.send('client-ping')
            }, 30 * 1000)
        }

        ws.onmessage = (e) => {
            if (typeof e.data != 'string') return
            console.log(e)
            console.log(e.data)
            try {
                const data = JSON.parse(e.data)

                if (data.type !== 'danmu') return

                const command = data.command as SocketDanmuCommand
                const msg = data.data as any
                switch (command) {

                }
                console.log("data: ", data)
                console.log("command: ", command)
                console.log("msg: ", msg)
            }
            catch (e) {
                console.log(e)
            }
        }

        ws.onerror = (e) => {
            console.error(e)
        }
    }

    useEffect(() => {
        init_listener()
    }, [])

    return (
        <div>
            <p>Danmu</p>
        </div>
    )
}

export default Danmu