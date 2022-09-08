import GameEvent from '../GameEvent';
import GameObject from './GameObject';
import { GameObjectType, GameOjbectTypeEnum } from './GameObjectType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameObjectManager extends cc.Component {
	@property({ type: GameObjectType, serializable: false })
	protected _type: GameOjbectTypeEnum = GameObjectType.None;

	@property({ type: GameObjectType })
	protected get type() {
		return this._type;
	}

	protected set type(value) {
		this._type = value;
		const index = this._convertedGameOjbectTypes.indexOf(value);
		if (index == -1) {
			this._convertedGameOjbectTypes.push(value);
			this._prefabs.push(null);
		}
		this.prefab = this._prefabs[this._convertedGameOjbectTypes.indexOf(value)];
	}

	@property({ type: cc.Prefab, serializable: false })
	protected _prefab: cc.Prefab | null = null;

	@property({ type: cc.Prefab, visible: function (this: GameObjectManager) { return this.type != GameObjectType.None } })
	protected get prefab() {
		return this._prefab;
	}

	protected set prefab(value: cc.Prefab | null) {
		this._prefab = value;

		if (this.type != GameObjectType.None) {
			this._prefabs[this._convertedGameOjbectTypes.indexOf(this.type)] = value;
		}
	}

	@property({ type: [cc.Prefab], visible: false })
	protected _prefabs = new Array<cc.Prefab | null>;

	@property([GameObjectType])
	protected _convertedGameOjbectTypes = new Array<GameOjbectTypeEnum>;


	protected onLoad(): void {
		cc.log(this._prefabs);
		this._handleEvents(true);
	}

	protected _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.CreateGameObject, this.OnCreateGameObject, this);
	}

	protected OnCreateGameObject(type: GameOjbectTypeEnum, callback: (node: cc.Node | null, gameObject?: GameObject) => void): void {
		if (!this._prefabs[this._convertedGameOjbectTypes.indexOf(type)]) {
			callback instanceof Function && callback(null);
			return;
		}

		const node = cc.instantiate(this._prefabs[this._convertedGameOjbectTypes.indexOf(type)] as cc.Prefab);
		const gameObject = node.getComponent(GameObject) || node.addComponent(GameObject);
		gameObject.type = type;

		callback instanceof Function && callback(node, gameObject);
	}
}
