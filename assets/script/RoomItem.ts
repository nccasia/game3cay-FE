import { _decorator, Button, Component, Label, Node } from 'cc';
import { WebRequestManager } from './WebRequestManager';
import { Room } from './UserInfo';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('RoomItem')
export class RoomItem extends Component {

    @property(Label)
    roomName: Label = null;

    @property(Button)
    joinButton: Button = null;

    private room: Room;
    start() {
        this.joinButton.node.on('click', this.onJoinRoom, this);
    }

    public setRoomName(roomName: string, roomId: string, room: Room) {
        this.roomName.string = roomName;
        this.room = room;
    }

    onJoinRoom() {
        console.log('Joining room:', this.room.id);
        WebRequestManager.instance.joinRoom(this.room);
    }
}