import { _decorator, Component, Label, Node } from 'cc';
import UserInfo from './UserInfo';
import { Global } from './Global';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(Label)
    nameLabel: Label = null;

    @property(Label)
    chipLabel: Label = null;

    @property(Node)
    ownerIcon: Node = null;

    @property(Node)
    readyIcon: Node = null;

    userInfo: UserInfo;
    isOwner: boolean;

    setup(userInfo: UserInfo) 
    {
        this.userInfo = userInfo;
        this.nameLabel.string = userInfo.username;
        this.chipLabel.string = Global.formatWallet(userInfo.wallet);
    }

    setOwner(isOwner: boolean) 
    {
        this.isOwner = isOwner;
        this.ownerIcon.active = isOwner;
        this.readyIcon.active = false;
    }

    setReady(isReady: boolean) 
    {
        if(this.isOwner) return;
        this.readyIcon.active = isReady;
        this.ownerIcon.active = false;
    }

    setToken(value: number){
        this.userInfo.wallet = value;
        this.chipLabel.string = Global.formatWallet(value);
    }

    public getUserInfo() {
        return this.userInfo;
    }
}