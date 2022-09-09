import GameEvent from '../GameEvent';
import ProgressBar from './ProgressBar';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreView extends cc.Component {

	@property(cc.Label)
	public label: cc.Label | null = null;

	@property(ProgressBar)
	public bar: ProgressBar | null = null;

	protected onEnable(): void {
		this._handleEvents(true);
	}

	protected onDisable(): void {
		this._handleEvents(false);
	}

	protected _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.UpdateScore, this.onUpdateScore, this);
	}

	protected onUpdateScore(score: number, maxScore: number) {
		if (this.bar) {
			this.bar.setProgress(score / maxScore);
		}

		if (this.label) {
			this.label.string = score + '/' + maxScore;
		}
	}
}
