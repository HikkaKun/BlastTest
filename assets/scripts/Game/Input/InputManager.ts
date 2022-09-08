import GameEvent from '../GameEvent';
import IInputCommand from './Commands/IInputCommand';
import TileInputCommand from './Commands/TileInputCommand';
import InputCatcher from './InputCatcher';
import { InputDirection, InputDirectionEnum } from './InputDirection';
import { InputType, InputTypeEnum } from './InputType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class InputManager extends cc.Component {
	private _inputCommands = new Map<InputDirectionEnum, IInputCommand>;

	protected onLoad(): void {
		this._handleEvents(true);
		this._inputCommands.set(InputDirection.Tile, new TileInputCommand());
	}

	private _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.Input, this.OnInput, this);
	}

	OnInput(type: InputTypeEnum, touch: cc.Touch, direction: InputDirectionEnum, inputCatcher: InputCatcher) {
		switch (type) {
			case InputType.Down:
				this._inputCommands.get(direction)?.onDown(touch, inputCatcher)
				break;
			case InputType.Move:
				this._inputCommands.get(direction)?.onMove(touch, inputCatcher)
				break;
			case InputType.Up:
				this._inputCommands.get(direction)?.onUp(touch, inputCatcher)
				break;
		}
	}
}
