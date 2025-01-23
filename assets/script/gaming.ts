import { _decorator, Component, Node, Label, SpriteFrame, Prefab, Vec3, tween, instantiate, setDisplayStats, Button, Toggle, ToggleComponent } from 'cc';
import { pokerCard } from './pokerCard';
import { WebRequestManager } from './WebRequestManager';
import { Global } from './Global';
import { Player } from './Player';
import { notification } from './notification';

const { ccclass, property } = _decorator;

interface pokerInfo {
    suit: string;
    point: number;
}

interface Position {
    x: number;
    y: number;
    rotation: number;
    isPlayer?: boolean;
}

@ccclass('gaming')
export class gaming extends Component {

    @property({ type: Node })
    public startGameNode: Node = null;

    @property({ type: Button })
    public startGameButton: Button = null;

    @property({ type: ToggleComponent })
    public AgreeGameToggle: ToggleComponent = null;

    @property({ type: Node })
    public container: Node = null;

    @property({ type: Node })
    public playersContainer: Node = null;

    @property({ type: Node })
    public notificationPopup: Node = null;

    @property({ type: Node })
    public nextRoundButton: Node = null;

    @property({ type: Label })
    public notificationLabel: Label = null;

    @property({ type: Player })
    public players: Player[] = [];

    private _playersNum: number = 5;
    public _playerHoleCards: { suit: string, point: number }[][] = [];
    private _roundGame: number = 0;
    private _maxPlayers: number = 5;

    @property({ type: Prefab })
    public pokerPrefab: Prefab = null;

    private _pot = 0;
    @property(Label)
    public potLabel: Label = null;

    @property({ type: [SpriteFrame] })
    public seatIcons: SpriteFrame[] = [];

    private listCard: pokerInfo[] = [];
    private playerRanks: { score: number; card: { suit: string; point: number }; index: number; name: string; rank: number }[] = [];
    private pokerCardPool: Node[] = [];
    private _mycard: pokerInfo[] = [];

    protected onLoad(): void {
        this.resetGame();
        const socket = WebRequestManager.instance.getSocket();

        socket.on('startedGame', (data: { playerHoleCards: pokerInfo[][], playerRanks: { score: number; card: { suit: string; point: number }; index: number; name: string; rank: number }[] }) => {
            notification.instance.hideLoading();
            this.resetGame();
            this._playerHoleCards = data.playerHoleCards;
            this.playerRanks = data.playerRanks;

            //  this.adjustPlayerData(data, userIndex, 3);

            this.startGameNode.active = false;
            this._playersNum = data.playerHoleCards.length;
            this.listCard = this.flattenPlayerHoleCards(data.playerHoleCards);
            const myIndex = Global.myRoomMembers.findIndex(member => member.id === Global.myInfo.id);
            if (myIndex !== -1) {
                this._mycard = this._playerHoleCards[myIndex];
            } else {
                console.error('Current user not found in room members!');
            }

            this.deal();
        });

        //this.setupPlayers();
        this.startGameButton.node.on('click', this.startGame, this);
        this.AgreeGameToggle.node.on(ToggleComponent.EventType.TOGGLE, this.agreeGame, this);

        socket.on('playerReady', (data: { readyPlayer: string[] }) => {
            console.log('Player ready:', data.readyPlayer);

            this.players.forEach((player) => {
                player.setReady(false);
            });

            data.readyPlayer.forEach(playerId => {
                const playerIndex = Global.myRoomMembers.findIndex(member => member.id === playerId);
                if (playerIndex !== -1) {
                    console.log(`Setting player ${playerIndex} (${playerId}) as ready`);
                    this.players[playerIndex].setReady(true);
                }
            });
        });

        socket.on('playerWallet', (data: { userID: string, newWalletAmount: number }[]) => {
            console.log('Player wallet:', data);
            data.forEach(walletData => {
                this.updatePlayerWallet(walletData.userID, walletData.newWalletAmount);
                const playerIndex = Global.myRoomMembers.findIndex(member => member.id === walletData.userID);
                if (playerIndex !== -1) {
                    this.players[playerIndex].setToken(walletData.newWalletAmount);
                } else {
                    console.error('Player not found');
                }
            });
        });
    }

    public setOwner() {
        this.players.forEach((player, index) => {
            const member = Global.myRoomMembers[index];
            if (member) {
                player.setOwner(member.id === Global.myRoom.owner);
            }
        });
    }

    protected onEnable(): void {
        this.AgreeGameToggle.isChecked = true;
    }

    public setChecked() {
        if (Global.myRoom.owner == Global.myInfo.id) this.AgreeGameToggle.isChecked = true;
    }

    private setButtonStatus() {
        this.startGameNode.active = true;

        const isOwner = Global.myRoom.owner == Global.myInfo.id;
        this.startGameButton.node.active = isOwner;
        this.AgreeGameToggle.node.active = !isOwner;
    }

    private agreeGame() {
        WebRequestManager.instance.getSocket().emit('agreeGame', { roomId: Global.myRoom.id, userId: Global.myInfo.id, agree: !this.AgreeGameToggle.isChecked });
    }

    private updatePlayerWallet(playerId: string, newWalletAmount: number): void {
        const playerIndex = Global.myRoomMembers.findIndex(member => member.id === playerId);
        if (playerIndex !== -1) {

        } else {
            console.error('Player not found');
        }
    }

    protected onDisable(): void {
        this.resetGame();
    }

    private resetGame(): void {
        for (let i = this.container.children.length - 1; i >= 1; i--) {
            this.returnPokerCardToPool(this.container.children[i]);
        }
        this._roundGame = 0;
        this.notificationPopup.active = false;
        this._playerHoleCards = [];
    }

    private flattenPlayerHoleCards(playerHoleCards: pokerInfo[][]): pokerInfo[] {
        const flattenedCards: pokerInfo[] = [];

        if (!Array.isArray(playerHoleCards) || playerHoleCards.length === 0) return flattenedCards;
        const maxCardsPerPlayer = playerHoleCards[0]?.length || 0;
        for (let i = 0; i < maxCardsPerPlayer; i++) {
            for (const playerCards of playerHoleCards) {
                if (Array.isArray(playerCards) && playerCards[i]) {
                    flattenedCards.push(playerCards[i]);
                }
            }
        }
        return flattenedCards;
    }

    start() {
        try {
            document.getElementById('__vconsole').style.display = 'none';
            setDisplayStats(false);
        } catch (error) { }
    }

    private adjustPlayerData(data: any, oldIndex: number, newIndex: number): void {
        const holeCard = data.playerHoleCards.splice(oldIndex, 1)[0];
        const rank = data.playerRanks.splice(oldIndex, 1)[0];

        while (data.playerHoleCards.length < this._maxPlayers) {
            data.playerHoleCards.push(null);
        }
        while (data.playerRanks.length < this._maxPlayers) {
            data.playerRanks.push(null);
        }

        data.playerHoleCards.splice(newIndex, 0, holeCard);
        data.playerRanks.splice(newIndex, 0, rank);
    }

    private setupPlayers(): void {
        this.reorderRoomMembers();
        const positions = this.getPlayersPosition();

        positions.forEach((position, index) => {
            const member = Global.myRoomMembers[index];
            if (member) {
                // Assign details if a player exists for the position

                console.log(`Player ${index} assigned:`, {
                    id: member.id,
                    username: member.username,
                    wallet: member.wallet,
                    email: member.email,
                    position,
                });
            } else {
                console.log(`Player ${index}: No player assigned (Empty Slot).`);
            }
        });
    }

    private reorderRoomMembers(): void {
        const userIndex = Global.myRoomMembers.findIndex(
            (member) => member.id === Global.myInfo.id
        );
        console.log('User index:', userIndex);
        if (userIndex !== -1) {
            const currentUser = Global.myRoomMembers.splice(userIndex, 1)[0];
            console.log('Current user:', currentUser);

            while (Global.myRoomMembers.length < this._maxPlayers) {
                Global.myRoomMembers.push(null);
            }

            Global.myRoomMembers.splice(3, 0, currentUser);
            console.log('Room members after reordering:', Global.myRoomMembers);
            if (Global.myRoomMembers.length > this._maxPlayers) {
                Global.myRoomMembers.length = this._maxPlayers;
            }
        } else {
            console.warn("Current user not found in room members!");
        }
    }

    onNextRound() {
        this.startGame();
    }

    setPlayerName(index: number, name: string) {
        console.log(`Setting player ${index} name to ${name}`);
        if (index >= 0 && index < this.players.length) {
            this.players[index].name = name;
        } else {
            console.error('Invalid player index');
        }
    }

    private getPlayersPosition(): Position[] {
        return [
            { x: -400, y: 160, rotation: 0 },
            { x: 270, y: 160, rotation: 0 },
            { x: 270, y: -160, rotation: 0 },
            { isPlayer: true, x: 0, y: -200, rotation: 0 },
            { x: -400, y: -160, rotation: 0 }
        ];
    }

    startGame() {
        WebRequestManager.instance.getSocket().emit('startGame', { roomId: Global.myRoom.id });
    }

    private getDynamicPlayersPosition(): Position[] {
        const basePositions = this.getPlayersPosition();
        const roomMembers = Global.myRoomMembers;

        if (!Array.isArray(roomMembers) || roomMembers.length === 0) {
            console.error("Room members are not properly initialized:", roomMembers);
            return basePositions;
        }

        const currentUserIndex = roomMembers.findIndex(
            (member) => member?.id === Global.myInfo.id
        );

        console.log('Current user index:', currentUserIndex);

        if (currentUserIndex === -1 || roomMembers.length > basePositions.length) {
            console.error("Too many room members for base positions!");
            return basePositions;
        }

        // Create reordered positions with the current user at index 0
        const reorderedPositions = [];
        for (let i = 0; i < roomMembers.length; i++) {
            const mappedIndex = (i + currentUserIndex) % roomMembers.length;
            reorderedPositions.push(basePositions[mappedIndex]);
        }

        console.log("Reordered positions:", reorderedPositions);
        return reorderedPositions;
    }

    public updatePlayer(owner: string, isUpdateOwner: boolean): void {
        for (let index = 0; index < this._maxPlayers; index++) {
            const member = Global.myRoomMembers[index];
            if (member) {
                this.players[index].setup(member);
                this.players[index].node.active = true;
            } else {
                this.players[index].node.active = false;
            }
        }

        this.players.forEach((player, index) => {
            const member = Global.myRoomMembers[index];
            if (member) {
                player.setOwner(String(member.id) === String(owner));
            }
        });
        if (!isUpdateOwner) this.setButtonStatus();
        else this.setChecked();
    }

    deal() {
        console.log('Dealing cards');

        const playerPos = this.getPlayersPosition();
        this._roundGame++;

        let positionIndex = 0;
        let total = this.listCard.length;
        let current = 0;
        let movedCards = 0;

        let cardsDealtPerPlayer = Array(this._playersNum).fill(0);
        this.schedule(() => {
            let poker = this.listCard[0];
            if (!poker) {
                console.error('Poker card is undefined');
                return;
            }
            let pokerCardPrefab = this.getPokerCardFromPool();
            let pokerComponent = pokerCardPrefab.getComponent(pokerCard);
            pokerCardPrefab.name = `${poker.suit}_${poker.point} ${positionIndex}`;

            const isPlayer = this._mycard.some(card => card.suit === poker.suit && card.point === poker.point);
            pokerComponent.setData(poker.suit, poker.point, isPlayer, positionIndex);

            cardsDealtPerPlayer[positionIndex]++;
            const currentRound = cardsDealtPerPlayer[positionIndex];
            const isSecond = currentRound === 2;
            const isThird = currentRound === 3;

            this._playerHoleCards[positionIndex]?.push(poker);

            pokerComponent.backPoker();
            this.container.addChild(pokerCardPrefab);

            pokerCardPrefab.setPosition(new Vec3(2, 217, 0));
            const pos = playerPos[positionIndex];

            const posVec = isThird ? new Vec3(pos.x + 160, pos.y, 0) : isSecond ? new Vec3(pos.x + 80, pos.y, 0) : new Vec3(pos.x, pos.y, 0);
            const playerPokerPos = isThird ? new Vec3(pos.x + 80, pos.y - 20, 0) : isSecond ? new Vec3(pos.x + 80, pos.y - 10, 0) : new Vec3(pos.x + 80, pos.y, 0);

            tween(pokerCardPrefab).to(0.4, { 
                position: isPlayer ? playerPokerPos : posVec,
                eulerAngles: Vec3.ZERO,
            }).call(() => {
                if (isPlayer) {
                    pokerComponent.setTargetPosition(posVec);
                }
            }).call(() => {
                current++;
                if (current == total) {
                    const pokerComponents = this.container.children
                        .map(child => child.getComponent(pokerCard))
                        .filter(pokerComponent => pokerComponent);

                    pokerComponents.reverse().forEach((pokerComponent, index) => {
                        if (pokerComponent.getIsMe()) {

                            pokerComponent.node.on('card-flipped', () => {
                                movedCards++;
                                if (movedCards >= 2) {
                                    pokerComponents.forEach((pokerComponent) => {
                                        if (pokerComponent.getIsMe()) {
                                            pokerComponent.moveToTargetPosition();
                                            pokerComponent.node.off('card-flipped');
                                            pokerComponent.setOpened();
                                        }
                                    });
                                }
                            });

                            if (this._mycard.length >= 2 &&
                                (this._mycard[1].point == pokerComponent.getPoint() && this._mycard[1].suit == pokerComponent.getSuit() ||
                                    this._mycard[2].point == pokerComponent.getPoint() && this._mycard[2].suit == pokerComponent.getSuit())) {
                                pokerComponent.addListener();
                            }
                            pokerComponent.flipPoker();
                        }
                    });

                    this.scheduleOnce(() => {
                        this.showScore();
                    }, 10);
                }
            }).start();
            positionIndex = (positionIndex + 1) % this._playersNum; // Move to the next player
            this.listCard.shift();
        }, 0.3, total - 1, 0);
    }

    private showScore() {
        const pokerComponents = this.container.children
            .map(child => child.getComponent(pokerCard))
            .filter(pokerComponent => pokerComponent);

        pokerComponents.reverse().forEach((pokerComponent) => {
            if (pokerComponent.getIsMe() && !pokerComponent.isMoveToTargetPosition()) {
                pokerComponent.moveToTargetPosition();
            }
            if (!pokerComponent.isMoveToTargetPosition()) {
                this.scheduleOnce(() => {
                    pokerComponent.tweenFlip();
                }, 0.2);
            }
        });

        this.scheduleOnce(() => {
            if (Global.myRoom.owner === Global.myInfo.id) {
                console.log('Emitting end game');
                WebRequestManager.instance.getSocket().emit('endGame', { roomId: Global.myRoom.id, userId: Global.myInfo.id });
            }
            this.notificationPopup.active = true;
            this.notificationLabel.string = this.playerRanks.map(rank =>
                `Rank: ${rank.rank}, Name: ${rank.name}, Score: ${rank.score}, Highest Card: ${rank.card.suit} ${rank.card.point}`
            ).join('\n');

            this.scheduleOnce(() => {
                this.notificationPopup.active = false;
                this.setButtonStatus();
                for (let i = this.container.children.length - 1; i >= 1; i--) {
                    this.returnPokerCardToPool(this.container.children[i]);
                }
            }, 5);
        }, 2);
    }

    private getPokerCardFromPool(): Node {
        if (this.pokerCardPool.length > 0) {
            return this.pokerCardPool.pop();
        } else {
            return instantiate(this.pokerPrefab);
        }
    }

    private returnPokerCardToPool(node: Node): void {
        node.removeFromParent();
        this.pokerCardPool.push(node);
    }

    public setPlayerWallet(playerId: string, walletAmount: number): void {
        const playerIndex = Global.myRoomMembers.findIndex(member => member.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].setToken(walletAmount);
        } else {
            console.error('Player not found');
        }
    }
}