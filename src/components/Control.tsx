import { useAppStore } from "@/stores"
import { Button } from "./ui/button";
import { ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { useState } from "react";
import { CommandList } from "cmdk";
import useRoomState from "@/utils/room";

const Control = () => {
  const { room, roomList, setRoom, deleteRoom } = useAppStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);
  const [searchValue, setSearchValue] = useState(""); // 新增搜索词状态
  const { connected, setConnected, startWebsocket, stopWebsocket } = useRoomState()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              variant="outline"
              role="combobox"
              className="justify-between truncate rounded-lg px-3 py-2 text-sm flex-1"
            >
              <span className="truncate text-left">
                {value
                  ? roomList.find((item) => item.roomid === value)?.uname || value
                  : "请选择直播间"
                }
              </span>
              <ChevronsUpDown className="opacity-50 ml-2 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] max-w-full p-0">
            <Command>
              <CommandInput
                placeholder="搜索直播间..."
                value={searchValue}  // 设置搜索词
                onValueChange={setSearchValue}  // 更新搜索词
              />
              <CommandList>
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
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="truncate mr-2">{searchValue}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 删除房间逻辑
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CommandItem>
                  )}
                  {roomList.map((item) => (
                    <CommandItem
                      key={String(item.roomid)}
                      value={`${item.roomid}-${item.uname}`} // 确保值唯一
                      onSelect={() => {
                        setRoom(item.roomid);
                        setValue(item.roomid);
                        setSearchValue("");
                        setOpen(false);
                      }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="truncate mr-2">{item.uname} ({item.roomid})</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 删除房间逻辑
                            deleteRoom(value)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="shrink-0">
          <Button
            onClick={() => {
              setConnected(!connected)
              connected ? stopWebsocket() : startWebsocket();
            }}
            className={`w-full sm:w-auto px-4 py-3 rounded-lg ${connected
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
              } text-white`}
          >
            {connected ? "断开监听" : "开启监听"}
          </Button>
        </div>
      </div>

      {room && connected && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">当前直播间</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">{roomList.find((item) => item.roomid === room)?.uname || value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">房间号: {room}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {connected ? '已连接' : '未连接'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Control;