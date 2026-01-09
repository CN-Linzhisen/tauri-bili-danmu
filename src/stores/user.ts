import { getUserInfoApi } from '@/apis/bilibili';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface AppStore {
    currentUser?: IUser;
    userList: IUser[];
    room: number;
    roomList: IRoom[];
    msgList: IMsg[];
    setCurrentUser: (user?: IUser) => void;
    setUserList: (users: IUser[]) => void;
    refreshCurrentUser: () => void;
    setRoom: (room: number) => void;
    addRoom: (room: IRoom) => void;
    deleteRoom: (roomid: number) => void;
    addMsg: (msg: IMsg) => void;
    clearMsg: () => void;
}

const useAppStore = create<AppStore>()(
    persist((set) => ({
        userList: [{
            mid: 0,
            uname: "",
            face: "",
            medals: [],
            medalCount: 0,
            wbi_img: {
                img_url: "",
                sub_url: ""
            },
        }],
        room: 0,
        roomList: [],
        msgList: [],
        setCurrentUser: (user) => set({ currentUser: user }),
        setUserList: (users) => set({ userList: users }),
        refreshCurrentUser: async () => {
            const { data } = await getUserInfoApi();
            if (!data) return;
            const { uname, face } = data;
            set(state => ({
                currentUser: state.currentUser ? { ...state.currentUser, uname, face } : undefined
            }))
        },
        setRoom: (roomid) => set({ room: roomid }),
        addRoom: (roomid) => set(state => ({
            roomList: [...state.roomList, roomid]
        })),
        deleteRoom: (roomid) => set(state => ({
            roomList: state.roomList.filter(item => item.roomid !== roomid)
        })),
        addMsg: (msg) => set(state => ({
            msgList: [...state.msgList, msg]
        })),
        clearMsg: () => set({
            msgList: []
        })
    }),
        {
            name: 'app-store',
            partialize: (state) => ({
                currentUser: state.currentUser,
                userList: state.userList,
                room: state.room,
                roomList: state.roomList
            })
        })
)

export { useAppStore };