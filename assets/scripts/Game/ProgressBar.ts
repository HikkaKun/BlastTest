const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBar extends cc.Component {
	@property(cc.Node)
	public bar: cc.Node | null = null;

	@property({ min: 0, max: 1 })
	protected stateOnStart = 0;

	@property({ min: 0, max: 1 })
	public progress = 1

	@property()
	public animationSpeed = 100;

	protected onLoad() {
		this.bar.x = this._calculateBarX(this.stateOnStart)
	}

	protected update(dt: number) {
		if (!this.bar) return;

		const destination = this._calculateBarX();

		if (this.bar.x == destination) return;

		this.bar.x += (this.bar.x < destination ? 1 : -1) * Math.min(Math.abs(Math.abs(this.bar.x) - Math.abs(destination)), this.animationSpeed * dt);
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
