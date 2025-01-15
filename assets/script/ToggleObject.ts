import { _decorator, Component, Node, RichText, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ToggleObject')
export class ToggleObject extends Toggle {
  @property({type: Node}) offNode: Node = null;
  @property({type: Node}) onNode: Node = null;

      onLoad() {
          this.node.on('toggle', this.onToggleChanged, this);
      }
  
      onEnable(): void {
          super.onEnable();
          this.onToggleChanged(this);
      }
  
      onDestroy() {
          this.node.off('toggle', this.onToggleChanged, this);
          super.onDestroy();
      }
  
      onToggleChanged(toggle: Toggle) {
        console.log('toggle', toggle.isChecked);
          this.onNode.active = toggle.isChecked ? true: false;
          this.offNode.active = !this.onNode.active;
      }
}