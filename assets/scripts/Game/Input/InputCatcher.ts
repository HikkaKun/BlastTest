const { ccclass, property } = cc._decorator;

@ccclass
export default class InputCatcher extends cc.Component {
	protected onEnable(): void {
		this.handleInput(true);
	}

	protected onDisable(): void {
		this.handleInput(false);
	}

	protected handleInput(isOn: boolean) {
		const func = isOn ? "on" : "off";

		this.node[func](cc.Node.EventType.TOUCH_START, this.onDown, this);
		this.node[func](cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
		this.node[func](cc.Node.EventType.TOUCH_END, this.onUp, this);
		this.node[func](cc.Node.EventType.TOUCH_CANCEL, this.onUp, this);
	}

	protected onDown(event: cc.Event.EventTouch) { }
	protected onMove(event: cc.Event.EventTouch) { }
	protected onUp(event: cc.Event.EventTouch) { }
}
