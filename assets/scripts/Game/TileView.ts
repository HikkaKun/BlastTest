const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
	public id: string = "";
	public x: number = -1;
	public y: number = -1;
}
