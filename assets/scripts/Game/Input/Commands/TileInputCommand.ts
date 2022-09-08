import GameEvent from '../../GameEvent';
import TileView from '../../TileView';
import InputCatcher from '../InputCatcher';
import IInputCommand from './IInputCommand';

export default class TileInputCommand extends IInputCommand {
	onDown(touch: cc.Touch, InputCatcher: InputCatcher): void {
		cc.systemEvent.emit(GameEvent.TileTap, InputCatcher.node.getComponent(TileView));
	}
}