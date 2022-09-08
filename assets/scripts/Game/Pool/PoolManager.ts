import Pool from './Pool';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PoolManager extends cc.Component {
	public pools = new Map<cc.Prefab, Pool>;

	protected onLoad() {
		const pools = this.node.getComponentsInChildren(Pool);

		for (const pool of pools) {
			if (pool.prefab == null) continue;

			this.pools.set(pool.prefab, pool);
		}
	}
}
