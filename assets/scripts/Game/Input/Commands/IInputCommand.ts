import InputCatcher from '../InputCatcher';

export default abstract class IInputCommand {
	onDown(touch: cc.Touch, InputCatcher: InputCatcher) { }
	onMove(touch: cc.Touch, InputCatcher: InputCatcher) { }
	onUp(touch: cc.Touch, InputCatcher: InputCatcher) { }
}