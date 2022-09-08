import Pool from './Pool';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PoolObject extends cc.Component {
	public pool: Pool | null = null;

	public returnToPool(): void {
		this.node.active = false;

		if (this.pool == null) return;

		this.node.parent = this.pool.node;
	}
}
