import ScoreView from './ScoreView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FinalView extends ScoreView {
	@property(cc.Node)
	public winLabel: cc.Node | null = null;

	@property(cc.Node)
	public loseLabel: cc.Node | null = null;

	protected onUpdateScore(score: number, maxScore: number, isWin?: boolean): void {
		if (this.winLabel && this.loseLabel) {
			if (isWin) {
				this.winLabel.active = true;
				this.loseLabel.active = false;
			} else {
				this.winLabel.active = false;
				this.loseLabel.active = true;
			}
		}

		if (this.label) {
			this.label.string = score + "/" + maxScore;
		}
	}
}
