import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface AppStore {
    currentUser?: IUser;
    userList: IUser[];

    setCurrentUser: (user: IUser) => void;
    setUserList: (users: IUser[]) => void;
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