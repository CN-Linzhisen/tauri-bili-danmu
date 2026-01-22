import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "./ui/button";
import { X, Plus } from "lucide-react"
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
            <Card className="relative h-46 w-40 flex items-center justify-center hover:shadow-lg transition-shadow">
                {currentUser?.mid && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="absolute right-0 top-0 border-none text-red-500 hover:text-red-600" onClick={handleExit}>
                                <X className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            退出登录
                        </TooltipContent>
                    </Tooltip>
                )}

                {currentUser?.mid ? (
                    <div className="flex flex-col items-center">
                        <Avatar className="h-16 w-16">
                            <AvatarImage referrerPolicy="no-referrer" src={currentUser.face} />
                            <AvatarFallback>{currentUser.uname[0]}</AvatarFallback>
                        </Avatar>
                        <span className="mt-5 text-sm">{currentUser.uname}</span>
                        <span className="text-xs text-neutral-400">{currentUser.mid}</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        {qrcodeShow ? (
                            <QRCodeLogin onSuccess={handleSuccessLogin} />
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full" onClick={handleAddNew}>
                                        <Plus className="h-4 w-4" />
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