import PoolObject from './PoolObject';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Pool extends cc.Component {
	@property(cc.Prefab)
	public prefab: cc.Prefab | null = null;

	@property()
	protected pregenerateCount: number = 0;

	protected _objects = new Array<cc.Node>;

	protected onLoad(): void {
		if (this.prefab == null) return;

		for (let i = 0; i < this.pregenerateCount; i++) {
			this.push(this._createNewObject() as cc.Node);
		}
	}

	private _createNewObject(): cc.Node | null {
		if (this.prefab == null) return null;

		const node = cc.instantiate(this.prefab);
		node.active = false;
		node.parent = this.node;

		const poolObject = node.getComponent(PoolObject) || node.addComponent(PoolObject);
		poolObject.pool = this;

		return node;
	}

	public pop(): cc.Node | null {
		return this._objects.pop() ?? this._createNewObject();
	}

	public push(node: cc.Node): void {
		this._objects.push(node);
	}
}
