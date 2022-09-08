import GameEvent from '../GameEvent';
import GameObject from './GameObject';
import { GameOjbectType, GameOjbectTypeEnum } from './GameObjectType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameObjectManager extends cc.Component {
	@property({ type: GameOjbectType, serializable: false })
	protected _type: GameOjbectTypeEnum = GameOjbectType.None;

	@property({ type: GameOjbectType })
	protected get type() {
		return this._type;
	}

	protected set type(value) {
		this._type = value;
		this.prefab = this._prefabs.get(value) ?? null;
	}

	@property({ type: cc.Prefab, serializable: false })
	protected _prefab: cc.Prefab | null = null;

	@property({ type: cc.Prefab, visible: function (this: GameObjectManager) { return this.type != GameOjbectType.None } })
	protected get prefab() {
		return this._prefab;
	}

	protected set prefab(value: cc.Prefab | null) {
		this._prefab = value;

		this._prefabs.set(this.type, value);
	}

	protected _prefabs = new Map<GameOjbectTypeEnum, cc.Prefab | null>;

	protected onLoad(): void {
		this._handleEvents(true);
	}

	protected _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.CreateGameObject, this.OnCreateGameObject, this);
	}

	protected OnCreateGameObject(type: GameOjbectTypeEnum, callback: (node: cc.Node | null, gameObject?: GameObject) => void): void {
		if (!this._prefabs.has(type)) {
			callback instanceof Function && callback(null);
			return;
		}

		const node = cc.instantiate(this._prefabs.get(type) as cc.Prefab);
		const gameObject = node.getComponent(GameObject) || node.addComponent(GameObject);
		gameObject.type = type;

		callback instanceof Function && callback(node, gameObject);
	}
}
