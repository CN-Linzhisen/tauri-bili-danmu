import { getUserInfoApi } from '@/apis/bilibili';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface AppStore {
    currentUser?: IUser;
    userList: IUser[];

    setCurrentUser: (user?: IUser) => void;
    setUserList: (users: IUser[]) => void;
    refreshCurrentUser: () => void;
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
        setCurrentUser: (user) => set({ currentUser: user }),
        setUserList: (users) => set({ userList: users }),
        refreshCurrentUser: async () => {
            const { data } = await getUserInfoApi();
            if (!data) return;
            const { uname, face } = data;
            set(state => ({
                currentUser: state.currentUser ? { ...state.currentUser, uname, face } : undefined
            }))
        }
    }),
        {
            name: 'app-store',
            partialize: (state) => ({
                currentUser: state.currentUser,
                userList: state.userList,
            })
        })
)

export { useAppStore };