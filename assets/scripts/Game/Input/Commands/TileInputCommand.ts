import { GameEvent } from '../../GameEvent';
import TileView from '../../GameView/TileView';
import InputCatcher from '../InputCatcher';
import IInputCommand from './IInputCommand';

export default class TileInputCommand extends IInputCommand {
	public onDown(touch: cc.Touch, InputCatcher: InputCatcher): void {
		cc.systemEvent.emit(GameEvent.TileTap, InputCatcher.node.getComponent(TileView));
	}
}