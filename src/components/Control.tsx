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
        <div className="flex items-center justify-between gap-1 rounded-md py-4 w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={open}
                        variant="outline"
                        role="combobox"
                        className="w-50 justify-between"
                    >
                        <span className="truncate">
                            {value
                                ? roomList.find((item) => item.roomid === value)?.uname || value
                                : "请选择直播间"
                            }
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0">
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
                                            <span className="truncate">{searchValue}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
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
                                            <span className="truncate">{item.uname} ({item.roomid})</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
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
            <Button onClick={() => {
                setConnected(!connected)
                connected ? stopWebsocket() : startWebsocket();
            }}>
                {connected ? "断开监听" : "开启监听"}
            </Button>
        </div>
    )
}

export default Control;