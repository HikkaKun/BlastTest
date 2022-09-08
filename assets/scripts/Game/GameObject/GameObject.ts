import { GameOjbectType, GameOjbectTypeEnum } from './GameObjectType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameObject extends cc.Component {
	@property({ type: GameOjbectType })
	type: GameOjbectTypeEnum = GameOjbectType.None;

	public kill(): void {
		this.node.active = false;
	}
}
