import { _decorator, Component, Node } from 'cc';
import * as GlobalVariable from '../Common/GlobalVariable';
import GlobalEvent from '../Common/GlobalEvent';
import ApiService from '../Service/APIService';
const { ccclass, property } = _decorator;

@ccclass('IAPManager')
export class IAPManager extends Component {
    getGold() {
        const dataEmit = {
            receiver_id: GlobalVariable.botId,
            amount: 0,
            note: `Quy đổi: 1 mezon = 1 Gold`,
            sender_id: GlobalVariable.myMezonInfo.id,
            sender_name: GlobalVariable.myMezonInfo.name
        };
        window.Mezon.WebView.postEvent("SEND_TOKEN", dataEmit);
        GlobalEvent.emit('startGetGold')
    }
    sendMezon() {
        const dataEmit = {
            receiver_id: '',
            amount: 0,
            note: `Send mezon to friend`,
            sender_id: GlobalVariable.myMezonInfo.id,
            sender_name: GlobalVariable.myMezonInfo.name
        };
        window.Mezon.WebView.postEvent("SEND_TOKEN", dataEmit);
    }

    getMezon(balance) {
        GlobalEvent.emit('swapToken', { user: GlobalVariable.myMezonInfo.id, balance: balance });
        ApiService.swapToken(GlobalVariable.myMezonInfo.id, balance);
    }
}