import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('rotateObject')
export class rotateObject extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.angle += 90 * deltaTime;
    }
}


