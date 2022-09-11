import GameEvent, { GameEventEnum } from '../GameEvent';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Toggle extends cc.Component {
	@property()
	protected isActiveOnStart = false;

	@property({ type: GameEvent })
	public event: GameEventEnum = GameEvent.None;

	@property()
	public onlyOpacity = false;

	@property()
	public invertBool = false;

	protected _isActive = false;
	protected _tween: cc.Tween | null = null;

	protected onLoad(): void {
		this._isActive = this.isActiveOnStart;
		if (!this._isActive) {
			this.node.active = this.onlyOpacity;
			this.node.opacity = 0;

		}

		this.event != GameEvent.None && cc.systemEvent.on(this.event, this.OnToggle, this);
	}

	public OnToggle(isOn = false, time = 0.5) {
		if (this.invertBool) {
			isOn = !isOn;
		}

		if (isOn != this._isActive) {
			this._isActive = isOn;

			if (isOn) {
				this.node.active = true;
			}

			this._tween && this._tween.stop();
			this._tween = cc.tween(this.node)
				.to(time, { opacity: isOn ? 255 : 0 })
				.call(() => { this.node.active = isOn || this.onlyOpacity })
				.start();
		}
	}
}
