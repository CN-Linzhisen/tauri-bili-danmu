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
        <Card className="relative min-h-40 min-w-44 flex items-center justify-center hover:shadow-lg transition-shadow p-5 rounded-lg">
          {currentUser?.mid && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="absolute right-2 top-2 border-none text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full h-6 w-6 p-0" 
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

          {currentUser?.mid ? (
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage 
                  referrerPolicy="no-referrer" 
                  src={currentUser.face} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/fallback-avatar.png';
                  }} 
                />
                <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                  <UserRound className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {currentUser.uname}
                </p>
                <p className="text-sm text-neutral-500 dark:text-slate-400 mt-1">
                  UID: {currentUser.mid}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              {qrcodeShow ? (
                <QRCodeLogin onSuccess={handleSuccessLogin} />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full h-16 w-16 p-4" 
                      onClick={handleAddNew}
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>点击登录帐号</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </Card>
      </TooltipProvider>
    )
}

export default Account;