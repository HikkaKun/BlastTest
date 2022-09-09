import GameObject from './GameObject/GameObject';
import View from './View';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
	public id: string = "";
	public x: number = -1;
	public y: number = -1;

	public view!: View;

	protected tween: cc.Tween | null = null;

	public tweenMove(): void {
		this.tween && this.tween.stop();

		this.tween = cc.tween(this.node)
			.to(1, { x: (this.x - this.view.gameWidth / 2 + 0.5) * this.view.blockSize, y: (this.y - this.view.gameHeight / 2 + 0.5) * -this.view.blockSize }, { easing: "bounceOut" })
			.start();
	}

	public tweenDestroy(): void {
		this.tween && this.tween.stop();

		this.tween = cc.tween(this.node)
			.to(0.25, { scale: 0 })
			.call(() => { this.node.getComponent(GameObject).kill() })
			.start();
	}
}
