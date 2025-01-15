import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('notification')
export class notification extends Component {
    @property(Node)
    notification: Node = null;

    @property(Label)
    label: Label = null;

    setNotification(message: string) {
        this.label.string = message;
        this.notification.active = true;
        setTimeout(() => {
            this.notification.active = false;
        }, 2000);
    }
}


