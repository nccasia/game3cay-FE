import { _decorator, Component, Node, SpriteFrame, Sprite, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('pokerCard')
export class pokerCard extends Component {

    @property({ type: SpriteFrame })
    public backSpriteFrame: SpriteFrame = null

    private suit: string = '';
    private point: number = 0;
    private isMe: boolean = false;

    setData(suit: string, point: number, isMe: boolean) {
        this.suit = suit;
        this.point = point;
        this.isMe = isMe;
    }

    public flipPoker() {
        this.showPoker(this.suit, this.point);
    }

    public getSuit() {
        return this.suit;
    }

    public getPoint() {
        return this.point;
    }

    public getIsMe() {
        return this.isMe;
    }

    public showPoker(suit: string, point: number) {
        let img = this.node.getChildByName('img');
        resources.load(`pokers/${suit}/${suit}_${point}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            img.getComponent(Sprite).spriteFrame = spriteFrame;
        });
    }


    public backPoker() {
        let img = this.node.getChildByName('img');
        img.getComponent(Sprite).spriteFrame = this.backSpriteFrame
    }


    update(deltaTime: number) {

    }
}

