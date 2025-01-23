import { SpriteFrame, assetManager, Texture2D, ImageAsset } from "cc";
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

    static getAvatar(avatarUrl: string, callback: (spriteFrame: SpriteFrame | null) => void): void {
        assetManager.loadRemote<ImageAsset>(avatarUrl, (err, imageAsset) => {
            if (err) {
                console.error('Failed to load image:', err);
                callback(null);
                return;
            }

            // Convert ImageAsset to SpriteFrame
            const texture = new Texture2D();
            texture.image = imageAsset;
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;

            callback(spriteFrame);
        });
    }
}