import { _decorator, Component, Sprite, assetManager, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('loading')
export class loading extends Component {
   
    private isLoaded: boolean = false;
    private elapsedTime: number = 0;

    @property(Sprite)
    spriteLoading: Sprite= null;

    update(deltaTime: number) {
        if (this.spriteLoading && !this.isLoaded) {
            this.elapsedTime += deltaTime;
            const progress = Math.max(0, 1 - this.elapsedTime / 2);
            this.spriteLoading.fillStart = progress;
            if (progress === 0) {
                this.isLoaded = true;
                director.loadScene("game");
            }
        }
    }
}