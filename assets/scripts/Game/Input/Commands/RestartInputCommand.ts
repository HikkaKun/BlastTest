import InputCatcher from '../InputCatcher';
import IInputCommand from './IInputCommand';

export default class RestartInputCommand extends IInputCommand {
	public onDown(touch: cc.Touch, InputCatcher: InputCatcher): void {
		cc.director.loadScene(cc.director.getScene().name);
	}
}