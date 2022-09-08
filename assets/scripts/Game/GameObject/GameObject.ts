import { GameObjectType, GameOjbectTypeEnum } from './GameObjectType';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameObject extends cc.Component {
	@property({ type: GameObjectType })
	type: GameOjbectTypeEnum = GameObjectType.None;

	public kill(): void {
		this.node.active = false;
	}
}
