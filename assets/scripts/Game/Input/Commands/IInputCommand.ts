import InputCatcher from '../InputCatcher';

export default abstract class IInputCommand {
	public onDown(touch: cc.Touch, InputCatcher: InputCatcher) { }
	public onMove(touch: cc.Touch, InputCatcher: InputCatcher) { }
	public onUp(touch: cc.Touch, InputCatcher: InputCatcher) { }
}