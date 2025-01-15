import { _decorator, Button, Component, instantiate, Label, Node, Prefab } from 'cc';
import { WebRequestManager } from './WebRequestManager';
import UserInfo, { Room } from './UserInfo';
import { Global } from './Global';
import { gaming } from './gaming';
const { ccclass, property } = _decorator;

@ccclass('LobbyManager')
export class LobbyManager extends Component {

  static instance: LobbyManager;

  @property(Node)
  roomList: Node = null;

  @property({ type: Prefab })
  public roomItemPrefab: Prefab = null;

  @property(Button)
  createRoomButton: Button = null;

  @property(Button)
  leaveRoom: Button = null;

  @property(Label)
  usernameLabel: Label = null;

  @property(Label)
  userWallet: Label = null;

  @property(Node)
  GameScene: Node = null;

  @property(Node)
  LobbyScene: Node = null;

  @property(gaming)
  gaming: gaming = null;

  protected onLoad(): void {
    LobbyManager.instance = this;
  }

  public updatePlayer(owner:string) {
    this.gaming.updatePlayer(owner);
  }

  protected start(): void {
    this.createRoomButton.node.on('click', this.onCreateRoom, this);
    this.leaveRoom.node.on('click', () => {
      WebRequestManager.instance.leaveRoom(Global.myRoom.id);
    });
  }

  protected onEnable(): void {
    this.onShowListRoom();
  }

  private updateRoomList(room: Room, index: number) {
    const existingRoomItems = this.roomList.children;
    let roomItem: Node;

    if (index < existingRoomItems.length) {
      roomItem = existingRoomItems[index];
    } else {
      roomItem = instantiate(this.roomItemPrefab);
      this.roomList.addChild(roomItem);
    }

    roomItem.active = true;
    (roomItem.getComponent('RoomItem') as any).setRoomName('Room_' + room.id, room.id, room);
    roomItem.name = `Room_${room.name}`;
  }

  onCreateRoom() {
    WebRequestManager.instance.createRoom((roomName: string, roomId: string, room: Room) => {
      this.updateRoomList(room, 0);
    });
  }

  onShowListRoom() {
    WebRequestManager.instance.getListRoom((rooms: Room[]) => {
      const roomCount = rooms.length;

      for (let i = 0; i < roomCount; i++) {
        this.updateRoomList(rooms[i], i);
      }

      const existingRoomItems = this.roomList.children;
      for (let i = roomCount; i < existingRoomItems.length; i++) {
        existingRoomItems[i].active = false;
      }
    });
  }

  public setUserInfo(userInfo: UserInfo) {
    this.usernameLabel.string = userInfo.displayName;
    if(userInfo.wallet) this.userWallet.string = Global.formatWallet(userInfo.wallet);
  }

  public loadGame(isLoadGame: boolean): void {
    this.LobbyScene.active = !isLoadGame;
    this.GameScene.active = isLoadGame;
  }
}