import GameEvent from '../GameEvent';
import PoolManager from '../Pool/PoolManager';
import GameObject from './GameObject';
import { GameObjectType, GameOjbectTypeEnum } from './GameObjectType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameObjectManager extends cc.Component {
	@property(PoolManager)
	protected poolManager: PoolManager | null = null;

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

	protected static _staticPrefabs = new Map<GameOjbectTypeEnum, cc.Prefab>;

	protected static _staticPoolManager: PoolManager;

	protected onLoad(): void {
		if (this.poolManager) GameObjectManager._staticPoolManager = this.poolManager;

		for (let i = 0; i < this._convertedGameOjbectTypes.length; i++) {
			GameObjectManager._staticPrefabs.set(this._convertedGameOjbectTypes[i], this._prefabs[i] as cc.Prefab);
		}

		this._handleEvents(true);
	}

	protected _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';
	}

	public static createGameOjbect(type: GameOjbectTypeEnum): cc.Node | null {
		if (!this._staticPrefabs.has(type) || this._staticPoolManager == null) return null;

		const node = this._staticPoolManager.pools.get(this._staticPrefabs.get(type) as cc.Prefab)?.pop();

		if (!node) return null;

		node.active = true;
		const gameObject = node.getComponent(GameObject) || node.addComponent(GameObject);
		gameObject.type = type;

		return node;
	}
}
