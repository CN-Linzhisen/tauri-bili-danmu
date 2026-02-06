import { useAppStore } from "@/stores"
import { Button } from "./ui/button";
import { ChevronsUpDown, X, Search, Radio, Power, Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { useState } from "react";
import { CommandList } from "cmdk";
import useRoomState from "@/utils/room";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const Control = () => {
  const { room, roomList, setRoom, deleteRoom } = useAppStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const { connected, setConnected, startWebsocket, stopWebsocket } = useRoomState()

  return (
    <Card className="h-full p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-0 shadow-lg rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col gap-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Settings2 className="w-5 h-5 text-slate-500" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">控制面板</h3>
      </div>

      <div className="space-y-4 flex-1">
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">选择直播间</label>
            <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                aria-expanded={open}
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 h-11 transition-all shadow-sm"
                >
                <div className="flex items-center gap-2 truncate">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="truncate text-slate-700 dark:text-slate-200">
                        {value
                        ? roomList.find((item) => item.roomid === value)?.uname || value
                        : "搜索或输入房间号..."
                        }
                    </span>
                </div>
                <ChevronsUpDown className="opacity-50 h-4 w-4 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-w-full p-0 border-0 shadow-xl rounded-xl overflow-hidden">
                <Command className="bg-white dark:bg-slate-800">
                <div className="flex items-center border-b border-slate-100 dark:border-slate-700 px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                        placeholder="输入房间号或主播名..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
                <CommandList className="max-h-[200px] overflow-y-auto p-1">
                    <CommandGroup>
                    {searchValue && !roomList.some(item => String(item.roomid).includes(searchValue)) && (
                        <CommandItem
                        value={searchValue}
                        onSelect={() => {
                            setRoom(Number(searchValue));
                            setValue(Number(searchValue));
                            setSearchValue("");
                            setOpen(false);
                        }}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                        <div className="flex justify-between items-center w-full">
                            <span className="truncate text-blue-600 dark:text-blue-400">添加: {searchValue}</span>
                        </div>
                        </CommandItem>
                    )}
                    {roomList.map((item) => (
                        <CommandItem
                        key={String(item.roomid)}
                        value={`${item.roomid}-${item.uname}`}
                        onSelect={() => {
                            setRoom(item.roomid);
                            setValue(item.roomid);
                            setSearchValue("");
                            setOpen(false);
                        }}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate font-medium text-slate-700 dark:text-slate-200">{item.uname}</span>
                                <span className="text-xs text-slate-400">ID: {item.roomid}</span>
                            </div>
                            <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteRoom(item.roomid)
                                if (value === item.roomid) setValue(0);
                            }}
                            >
                            <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        </CommandItem>
                    ))}
                    </CommandGroup>
                </CommandList>
                </Command>
            </PopoverContent>
            </Popover>
        </div>

        <div className="space-y-2">
             <label className="text-sm font-medium text-slate-600 dark:text-slate-400">连接控制</label>
             <Button
                onClick={() => {
                setConnected(!connected)
                connected ? stopWebsocket() : startWebsocket();
                }}
                disabled={!room}
                className={`w-full h-12 rounded-xl text-base font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
                    connected
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20"
                }`}
            >
                {connected ? (
                    <>
                        <Power className="mr-2 h-5 w-5" />
                        停止监听
                    </>
                ) : (
                    <>
                        <Radio className="mr-2 h-5 w-5" />
                        开始监听
                    </>
                )}
            </Button>
        </div>
      </div>

      {room ? (
        <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</span>
              <div className="flex items-center gap-2">
                <span className={`relative flex h-2.5 w-2.5`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                </span>
                <span className={`text-sm font-semibold ${connected ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                    {connected ? '正在接收弹幕' : '等待连接'}
                </span>
              </div>
            </div>
            {connected && (
                <Badge variant="outline" className="bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
                    实时
                </Badge>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                 <span className="font-medium truncate max-w-[120px]">
                     {roomList.find((item) => item.roomid === room)?.uname || room}
                 </span>
                 <span className="text-slate-300 dark:text-slate-600">|</span>
                 <span className="font-mono text-xs text-slate-400">#{room}</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-sm">
            暂无连接信息
        </div>
      )}
    </Card>
  )
}

export default Control;