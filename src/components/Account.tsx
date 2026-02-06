import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "./ui/button";
import { X, Plus, UserRound } from "lucide-react"
import { useAppStore } from "@/stores";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QRCodeLogin from "./QRCodeLogin";
import { useState } from "react";
const Account = () => {
  const { currentUser, refreshCurrentUser, setCurrentUser } = useAppStore();
  const [qrcodeShow, setQrcodeShow] = useState(false)

  const handleAddNew = () => {
    setQrcodeShow(true)
  }

  const handleSuccessLogin = () => {
    console.log('handleSuccessLogin')
    setQrcodeShow(false)
    refreshCurrentUser()
  }

  const handleExit = () => {
    setCurrentUser(undefined);
  }
  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg rounded-2xl transition-all duration-300 hover:shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 h-full">
        {currentUser?.mid && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="absolute right-3 top-3 h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors z-20"
                onClick={handleExit}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              退出登录
            </TooltipContent>
          </Tooltip>
        )}

        <div className="h-full flex flex-col items-center justify-center p-6">
          {currentUser?.mid ? (
            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mb-4 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
                <Avatar className="h-24 w-24 rounded-full ring-4 ring-white dark:ring-slate-800 shadow-md relative">
                  <AvatarImage
                    referrerPolicy="no-referrer"
                    src={currentUser.face?.replace('http:', 'https:')}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.svg';
                      target.onerror = null;
                    }}
                  />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                    <UserRound className="h-10 w-10 text-slate-400" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                  {currentUser.uname}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    UID: {currentUser.mid}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full min-h-[240px]">
              {qrcodeShow ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full">
                  <div className="flex justify-end w-full mb-2 -mt-8 mr-[-10px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-600"
                      onClick={() => setQrcodeShow(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <QRCodeLogin onSuccess={handleSuccessLogin} />
                </div>
              ) : (
                <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative group cursor-pointer" onClick={handleAddNew}>
                    <div className="absolute -inset-2 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-md"></div>
                    <Button
                      variant="outline"
                      className="relative h-20 w-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-400 hover:text-blue-500 transition-all duration-300 shadow-sm"
                    >
                      <Plus className="h-8 w-8" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">未登录</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">点击上方按钮登录 Bilibili 账号</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  )
}

export default Account;