
class UserInfo {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    wallet: number;
    email: string;

    constructor(id: string, username: string, displayName: string, avatarUrl: string, wallet: number, email: string) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.avatarUrl = avatarUrl;
        this.wallet = wallet;
        this.email = email;

    }
}

class Room {
    id: string;
    name: string;
    wallet: number;
    members: string[];
    owner: string;
    betAmount: number;
    constructor(id: string, name: string, wallet: number, members: string[], owner: string) {
        this.id = id;
        this.name = name;
        this.wallet = wallet;
        this.members = members;
        this.owner = owner;
    }
}

export default UserInfo;
export { Room };
