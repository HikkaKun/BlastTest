import BlockConfig from './BlockConfig';
import BlastGame, { BlastGameConfig, BlastGameCallbacks, Position } from '../Model/BlastGame';
import Color from '../Model/Color';
import TileView from './TileView';
import GameEvent from './GameEvent';

const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {
	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];

	@property(cc.Prefab)
	public tileViewPrefab: cc.Prefab = null;

	public blocks = new Map<Color, cc.SpriteFrame>;

	public game!: BlastGame;

	public tiles = new Map<string, TileView>;

	protected onLoad() {
		for (const blockConfig of this.blockConfigs) {
			this.blocks.set(blockConfig.color as Color, blockConfig.spriteFrame);
		}

		const config: BlastGameConfig = {
			width: 9,
			height: 9,
			winScore: 25,
			turnsNumber: 10
		};
		const callbacks: BlastGameCallbacks = {
			OnDestroyTile: (position) => this.OnDestroyTile(position),
			OnGenerateTile: (forPosition, fromOutside) => this.OnGenerateTile(forPosition, fromOutside),
			OnMoveTile: (oldPosition, newPosition) => this.OnMoveTile(oldPosition, newPosition)
		};

		this.game = new BlastGame(config, callbacks);
		this.game.initField();
	}

	protected onEnable(): void {
		this._handleEvents(true);
	}

	protected onDisable(): void {
		this._handleEvents(false);
	}

	private _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.TileTap, this.OnTileTap, this);
	}

	private OnTileTap(tile: TileView): void {
		cc.log(tile.id);
	}

	private OnDestroyTile(position: Position) {

	}

	private OnGenerateTile(forPosition: Position, fromOutside: boolean) {
		const node = cc.instantiate(this.tileViewPrefab);
		node.parent = this.node;

		const view = node.getComponent(TileView);
		view.id = forPosition.toString();
		view.x = forPosition.x;
		view.y = forPosition.y;

		const sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = this.blocks.get(this.game.tileAt(forPosition.x, forPosition.y)?.color as Color) as cc.SpriteFrame;

		node.x = forPosition.x * 40;
		node.y = forPosition.y * -40;

		node.width = 40;
		node.height = 40;
	}

	private OnMoveTile(oldPosition: Position, newPosition: Position) {

	}
}
