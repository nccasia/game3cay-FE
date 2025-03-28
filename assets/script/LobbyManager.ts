import { _decorator, Button, Component, instantiate, Label, Node, Prefab } from 'cc';
import { WebRequestManager } from './WebRequestManager';
import UserInfo, { Room } from './UserInfo';
import { Global } from './Global';
import { gaming } from './gaming';
import { UIManager } from './Common/UIManager';
import { UIID } from './Common/UIID';
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
  choose1kButton: Button = null;

  @property(Button)
  choose2kButton: Button = null;

  @property(Button)
  choose5kButton: Button = null;

  @property(Button)
  choose10kButton: Button = null;

  @property(Node)
  chooseBetNodde: Node = null;

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

  @property(Button)
  closeChooseBet: Button = null;

  protected onLoad(): void {
    LobbyManager.instance = this;
  }

  public updatePlayer(owner: string, isUpdateOwner: boolean) {
    this.gaming.updatePlayer(owner, isUpdateOwner);
  }

  public setPlayerWallet(playerId: string, walletAmount: number) {
    this.gaming.setPlayerWallet(playerId, walletAmount);
  }

  protected start(): void {
    this.createRoomButton.node.on('click', this.onCreateRoom, this);
    this.leaveRoom.node.on('click', () => {
      WebRequestManager.instance.leaveRoom(Global.myRoom.id);
    });

    const betButtons = [
      { button: this.choose1kButton, bet: 1000 },
      { button: this.choose2kButton, bet: 2000 },
      { button: this.choose5kButton, bet: 5000 },
      { button: this.choose10kButton, bet: 10000 }
    ];

    betButtons.forEach(({ button, bet }) => {
      button.node.on('click', () => {
      this.onChooseBet(bet);
      });
    });

    // this.closeChooseBet.node.on('click', () => {
    //   this.chooseBetNodde.active = false;
    // });
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
    (roomItem.getComponent('RoomItem') as any).setRoomName(room.id + "_" + room.betAmount, room.id, room);
    roomItem.name = `Room_${room.name}`;
  }

  onCreateRoom() {
    // this.chooseBetNodde.active = true;
    UIManager.Instance.showUI(UIID.ChooseBet);
    
  }

  onChooseBet(bet: number) {
    // this.chooseBetNodde.active = false;
    UIManager.Instance.HideUI(UIID.ChooseBet);
    WebRequestManager.instance.createRoom(bet ,(roomName: string, roomId: string, room: Room) => {
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
    console.log('setUserInfo ', userInfo.wallet);
    this.usernameLabel.string = userInfo.displayName;
    if (userInfo.wallet) this.userWallet.string = Global.formatWallet(userInfo.wallet);
  }

  public loadGame(isLoadGame: boolean): void {
    this.LobbyScene.active = !isLoadGame;
    this.GameScene.active = isLoadGame;
  }
}