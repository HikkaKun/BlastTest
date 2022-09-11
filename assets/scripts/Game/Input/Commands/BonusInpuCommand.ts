import { GameEvent } from '../../GameEvent';
import BonusView from '../../Ui/Bonus/BonusView';
import InputCatcher from '../InputCatcher';
import IInputCommand from './IInputCommand';

export default class BonusInputCommand extends IInputCommand {
	public onDown(touch: cc.Touch, InputCatcher: InputCatcher): void {
		cc.systemEvent.emit(GameEvent.Bonus, InputCatcher.node.getComponent(BonusView)?.type);
	}
}