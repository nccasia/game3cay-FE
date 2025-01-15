import UserInfo, { Room } from "./UserInfo";

export class Global {
    static formatWallet(value: number): string {
        if (value >= 1000000000) {
            return (value / 1000000000).toFixed(0) + "B";
        } else if (value >= 1000000) {
            return (value / 1000000).toFixed(0) + "M";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
        } else {
            return value.toString();
        }
    }

    static myRoom: Room;
    static myInfo: UserInfo;    
    static myRoomMembers: UserInfo[] = [];
}