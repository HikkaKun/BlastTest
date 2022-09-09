const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBar extends cc.Component {
	@property(cc.Node)
	public bar: cc.Node | null = null;

	@property({ min: 0, max: 1 })
	protected stateOnStart = 0;

	@property({ min: 0, max: 1 })
	private _progress = 1;

	@property({ min: 0, max: 1 })
	public get progress() {
		return this._progress;
	}

	public set progress(value) {
		this._progress = Math.min(1, Math.max(value, 0));
	}

	@property({ min: 0.1, max: 1 })
	public animationSpeed = 0.1;

	protected onLoad() {
		if (this.bar) this.bar.x = this._calculateBarX(this.stateOnStart)
	}

	protected update(dt: number) {
		if (!this.bar) return;

		const destination = this._calculateBarX();

		if (this.bar.x == destination) return;

		this.bar.x = (this.bar.x * (1 - this.animationSpeed) + destination * this.animationSpeed);
	}

	protected _calculateBarX(progress?: number): number {
		if (!this.bar) return 0;

		progress = progress ?? this.progress;

		const barWidth = this.bar.width * this.bar.scaleX;

		return -barWidth / 2 - barWidth + barWidth * progress;
	}

	public setProgress(progress: number, instant = false): void {
		if (!this.bar) return;

		this.progress = progress;

		if (instant) {
			this.bar.x = this._calculateBarX();
		}
	}
}
