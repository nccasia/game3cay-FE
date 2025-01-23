import { _decorator, Component, Node, SpriteFrame, Sprite, resources, EventTouch, UITransform, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('pokerCard')
export class pokerCard extends Component {

    @property({ type: SpriteFrame })
    public backSpriteFrame: SpriteFrame = null

    @property({ type: Node })
    public cardFront: Node = null

    private suit: string = '';
    private point: number = 0;
    private isMe: boolean = false;
    private isOpened: boolean = false;
    private targetPosition: Vec3;
    private cardIndex: number = 0;

    setData(suit: string, point: number, isMe: boolean, cardIndex: number) {
        this.suit = suit;
        this.point = point;
        this.isMe = isMe;
        if (this.isMe) this.cardIndex = cardIndex;
    }

    addListener() {
        this.isOpened = false;
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    public GetOpenedCardStatus(): boolean {
        return !this.cardFront.active;
    }

    onTouchMove(event: EventTouch) {
        if (this.isOpened || !this.isMe) return;
        
        const delta = event.getDelta();
        if (delta.x !== 0) return;

        this.node.setPosition(this.node.position.x, this.node.position.y + delta.y);

        const positionY = this.node.position.y;
        const targetY = this.targetPosition.y;

        if (positionY <= targetY - 100 || positionY >= targetY + 100) {
            this.isOpened = true;
            this.node.emit('card-flipped', this);
            const moveToTarget = tween(this.node)
                .to(0.2, { position: this.targetPosition })
                .call(() => this.tweenFlip());

            if (this.isMe)  moveToTarget.start();
            else this.tweenFlip();
        }
    }

    public tweenFlip() {
        const flipTween = tween(this.node)
            .to(0.2, { eulerAngles: new Vec3(0, -90, 0), scale: new Vec3(1.1, 1.1, 1.1) })
            .call(() => {
                this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
                this.flipPoker();
            })
            .by(0.2, { eulerAngles: new Vec3(0, 90, 0) });
        flipTween.start();
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

    public getCardIndex() {
        return this.cardIndex;
    }

    public getIsMe() {
        return this.isMe;
    }

    public isMoveToTargetPosition() {
        return this.isOpened;
    }

    public setOpened() {
        this.isOpened = true;
    }

    public showPoker(suit: string, point: number) {
        resources.load(`pokers/${suit}/${suit}_${point}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            this.cardFront.getComponent(Sprite).spriteFrame = spriteFrame;
        });
    }

    public backPoker() {
        let img = this.node.getChildByName('img');
        img.getComponent(Sprite).spriteFrame = this.backSpriteFrame
    }

    setTargetPosition(pos: Vec3) {
        this.targetPosition = pos;
    }

    public moveToTargetPosition() {
        tween(this.node)
            .to(0.2, { position: this.targetPosition })
            .call(() => {
                this.tweenFlip();
            })
            .start();
                
    }
}