import ScoreView from '../ScoreView';
import { ViewBonusType, ViewBonusTypeEnum } from './ViewBonusType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BonusView extends ScoreView {
	@property({ type: ViewBonusType })
	type: ViewBonusTypeEnum = ViewBonusType.Swap;

	protected onUpdateScore(type: ViewBonusTypeEnum, value: number): void {
		if (this.label) {
			this.label.string = value.toString();
		}
	}
}
