import { ViewColor, ViewColorEnum } from './ViewColor';

const { ccclass, property } = cc._decorator;

@ccclass('BlockConfig')
export default class BlockConfig {
	@property(cc.SpriteFrame)
	public spriteFrame: cc.SpriteFrame = null;

	@property({ type: ViewColor, })
	public color: ViewColorEnum = ViewColor.Blue;
}
