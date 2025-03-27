import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

import io from 'socket.io-client/dist/socket.io.js';
import { LobbyManager } from './LobbyManager';
import UserInfo, { Room } from './UserInfo';
import { Global } from './Global';
import { notification } from './notification';
import * as GlobalVariable from './Common/GlobalVariable';

@ccclass('WebRequestManager')
export class WebRequestManager extends Component {
    static instance: WebRequestManager;
    private socket: any;
    
    @property({ type: notification })
    public notification: notification = null;

    onLoad() {
        WebRequestManager.instance = this;
        const baseWsUrl = `${GlobalVariable.useSSL ? "wws" : "ws"}://${GlobalVariable.hostname}:${GlobalVariable.useSSL ? "" : `:${GlobalVariable.port}`}`;
        //this.socket = io('wss://game-pocker-api.nccsoft.vn/', { transports: ['websocket'] });
        this.socket = io('ws://localhost:3200', { transports: ['websocket'] });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('status', (message) => {
            console.log('Status message from server:', message);
            this.notification.setNotification(message.message);
        });

        this.socket.on('roomCreated', (message: any) => {
            console.log('Room Created:', message);
        });

        this.socket.on('listRoom', (message: Room[]) => {
            console.log('List Room:', JSON.stringify(message, null, 2));
            message.forEach((element: Room) => {
                if (this.roomCreatedCallback) {
                    this.roomCreatedCallback(element.id + "_" + element.betAmount, element.id, element);
                }
            });

            this.roomFetchCallback(message);
        });

        this.socket.on("roomJoined", (roomInfo: any) => {
            console.log('roomJoined userInfo:', roomInfo);
            Global.myRoom = roomInfo;
            Global.myRoom.id = roomInfo.roomId;
            Global.myRoomMembers = roomInfo.roomMembers;

            LobbyManager.instance.updatePlayer(roomInfo.owner, false);
            LobbyManager.instance.loadGame(true);
        });

        this.socket.on("roomLeft", (roomInfo: any) => {
            console.log('roomMembers info:', roomInfo.roomMembers, Global.myInfo.id);
            const isMyIdInRoomMembers = roomInfo.roomMembers && roomInfo.roomMembers.some(member => member === String(Global.myInfo.id));
            if (roomInfo.roomMembers && isMyIdInRoomMembers) {
                const updatedMembers = Global.myRoomMembers.filter(member => {
                    return roomInfo.roomMembers.includes(member.id);
                });
                Global.myRoomMembers = updatedMembers;
                LobbyManager.instance.updatePlayer(roomInfo.owner, false);
            } else {
                Global.myRoom = null;
                Global.myRoomMembers = [];
                LobbyManager.instance.loadGame(false);
            }
        });


        this.socket.on("startBet", (data) => {
            const { totalBet, receiverId, currentGameId, appId } = data;
            const dataEmit = {
                receiver_id: receiverId,
                amount: totalBet,
                note: `Đã đặt cược ${totalBet} token khi chơi game 3kay của NCC Studio!`,
                sender_id: Global.myInfo.id,
                sender_name: Global.myInfo.username,
                extra_attribute: JSON.stringify({
                    sessionId: currentGameId,
                    appId,
                }),
            };
            window.Mezon.WebView.postEvent("SEND_TOKEN", dataEmit);
            this.notification.showLoading();
        });

        this.socket.on("playerWalletUpdated", (data) => {
            console.log("playerWalletUpdated", data);
            data.forEach(walletItem => {
                if (walletItem.userId === Global.myInfo.id) {
                    Global.myInfo.wallet = data.wallet;
                    LobbyManager.instance.setUserInfo(Global.myInfo);
                }
                LobbyManager.instance.setPlayerWallet(walletItem.userId, walletItem.wallet);
            });
        });

        this.socket.on("userConfirmed", (data) => {
            this.notification.hideLoading();
            this.notification.setNotification(data.message);
        });

        this.socket.on("updateOwner", (data) => {
            console.log("updateOwner", data);
            Global.myRoom.owner = data.roomOwner;
            LobbyManager.instance.updatePlayer(data.roomOwner, true);
        });

        this.socket.on("balance", (data) => {
            Global.myInfo.wallet = data;
            LobbyManager.instance.setUserInfo(Global.myInfo);
        });

        this.getUserInfo();
    }

    private roomCreatedCallback: (roomName: string, roomId: string, room: Room) => void;
    private roomFetchCallback: (roomInfo: Room[]) => void;

    public getListRoom(Rooms: (rooms: Room[]) => void) {
        this.roomFetchCallback = Rooms; // Store the callback
        this.socket.emit('listRoom', (ackResponse: any) => {
            console.log('Acknowledgment from server:', ackResponse);
        });
    }

    public createRoom(betAmount: number, callback: (roomName: string, roomId: string, room: Room) => void) {
        this.roomCreatedCallback = callback; // Store the callback
        this.socket.emit('createRoom', { name: "new_room", betAmount: betAmount }, (ackResponse: any) => {
            console.log('Acknowledgment from server:', ackResponse);
        });
    }

    public joinRoom(room: Room) {
        this.socket.emit('joinRoom', { roomId: room.id, userInfo: Global.myInfo }, (ackResponse: any) => {
            console.log('Acknowledgment from server:', ackResponse);
        });
    }

    public leaveRoom(roomId: string) {
        this.socket.emit('leaveRoom', { id: roomId, userId: Global.myInfo.id }, (ackResponse: any) => {
            console.log('Acknowledgment from server:', ackResponse);
        });
    }

    public getBalance() {
        this.socket.emit('getBalance', { userInfo: Global.myInfo }, (ackResponse: any) => {
            console.log('Acknowledgment from server:', ackResponse);
        });
    }

    protected onDisable(): void {
        if (Global.myRoom.id) this.leaveRoom(Global.myRoom.id);
        this.socket.disconnect();
    }

    getSocket() {
        return this.socket;
    }

    getUserInfo() {
        window.Mezon.WebView.postEvent("PING", { message: "Hello Mezon!" });
        window.Mezon.WebView.onEvent("PONG", (data) => {
            console.log("Hello Mezon Again!", data);
        });

        window.Mezon.WebView.onEvent("CURRENT_USER_INFO", (_, userData) => {
            console.log("getUserInfo", userData);
            if (!userData || !userData.user) {
                return;
            }
            const user = {
                id: userData.user?.id,
                displayName: userData.user?.display_name,
                username: userData.user?.username,
                avatarUrl: userData.user?.avatar_url,
                email: userData?.email,
                wallet: JSON.parse(userData.wallet).value || 0,
            };
            const userInfoObj = new UserInfo(
                user.id,
                user.username,
                user.displayName,
                user.avatarUrl,
                user.wallet,
                user.email
            );
            Global.myInfo = userInfoObj;
            this.socket.emit("userInfo", Global.myInfo);
            LobbyManager.instance.setUserInfo(userInfoObj);
        });

        window.Mezon.WebView.onEvent("SEND_TOKEN_RESPONSE_FAILED", (data) => {
            this.socket.emit('userCancelBet', { roomId: Global.myRoom.id, userId: Global.myInfo.id }, (ackResponse: any) => {
                console.log('Acknowledgment from server:', ackResponse);
            });
        });

        // window.Mezon.WebView.onEvent("SEND_TOKEN_RESPONSE_SUCCESS", (data) => {
        //     this.socket.emit('userConfirmBet', { roomId: Global.myRoom.id, userId: Global.myInfo.id }, (ackResponse: any) => {
        //         console.log('Acknowledgment from server:', ackResponse);
        //     });
        // });

        window.Mezon.WebView.onEvent('SEND_TOKEN_RESPONSE_SUCCESS', (type, data) => {
            console.log('SEND_TOKEN_RESPONSE_SUCCESS ', data)
            WebRequestManager.instance.getBalance();
        });
    }
}