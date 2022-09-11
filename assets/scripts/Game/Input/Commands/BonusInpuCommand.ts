import GameEvent from '../../GameEvent';
import TileView from '../../TileView';
import BonusView from '../../Ui/Bonus/BonusView';
import InputCatcher from '../InputCatcher';
import IInputCommand from './IInputCommand';

export default class BonusInputCommand extends IInputCommand {
	onDown(touch: cc.Touch, InputCatcher: InputCatcher): void {
		cc.systemEvent.emit(GameEvent.Bonus, InputCatcher.node.getComponent(BonusView)?.type);
	}
}