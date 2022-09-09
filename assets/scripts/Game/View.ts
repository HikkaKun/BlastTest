import BlockConfig from './BlockConfig';
import BlastGame, { BlastGameConfig, BlastGameCallbacks, Position } from '../Model/BlastGame';
import Color from '../Model/Color';
import TileView from './TileView';
import GameEvent from './GameEvent';
import { GameObjectType, GameOjbectTypeEnum } from './GameObject/GameObjectType';
import GameObject from './GameObject/GameObject';
import GameObjectManager from './GameObject/GameObjectManager';
import { ViewColor } from './ViewColor';

const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {

	//#region game settings

	@property({ min: 1, step: 1 })
	public minTileGroupSize = 2;

	@property({ min: 2, max: Object.keys(Color).length / 2 })
	public colors = 5;

	@property({ min: 3, step: 1 })
	public gameWidth = 7;

	@property({ min: 3, step: 1 })
	public gameHeight = 7;

	@property({ min: 1, step: 1 })
	public winScore = 25;

	@property({ min: 1, step: 1 })
	public turns = 25;

	@property({ min: 0, step: 1 })
	public shuffles = 1;

	@property({ min: 0, step: 1 })
	public boosterRadius = 2;

	@property({ min: 1, step: 1 })
	public minSuperTileGroupSize = 5;

	//#endregion

	@property(cc.Prefab)
	public tileViewPrefab: cc.Prefab | null = null;

	@property({ type: GameObjectType })
	public tilePrefab: GameOjbectTypeEnum = GameObjectType.None;

	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];

	public blocks = new Map<Color, cc.SpriteFrame>;

	public game!: BlastGame;

	public tiles = new Map<string, TileView>;

	protected onLoad() {
		for (const blockConfig of this.blockConfigs) {
			this.blocks.set(blockConfig.color as Color, blockConfig.spriteFrame);
		}

		const config: BlastGameConfig = {
			width: this.gameWidth,
			height: this.gameHeight,
			winScore: this.winScore,
			turnsNumber: this.turns,
			minTilesGroupSize: this.minTileGroupSize,
			colors: this.colors,
			shuffles: this.shuffles,
			boosterRadius: this.boosterRadius,
			minSuperTileGroupSize: this.minSuperTileGroupSize
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
		this.game.tapAt(tile.x, tile.y);
	}

	private OnDestroyTile(position: Position) {
		const tile = this.tiles.get(position.toString()) as TileView;
		cc.tween(tile.node)
			.to(0.25, { scale: 0 })
			.call(() => { tile.node.getComponent(GameObject).kill() })
			.start();
		this.tiles.delete(position.toString());
	}

	private OnGenerateTile(forPosition: Position, fromOutside: boolean) {
		const node = GameObjectManager.createGameOjbect(this.tilePrefab);

		if (!node) return;

		node.parent = this.node;

		const view = node.getComponent(TileView);
		view.id = forPosition.toString();
		view.x = forPosition.x;
		view.y = forPosition.y;

		const sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = this.blocks.get(this.game.tileAt(forPosition.x, forPosition.y)?.color as Color) as cc.SpriteFrame;

		node.x = forPosition.x * 40;
		node.y = (fromOutside ? forPosition.y - this.game.height : forPosition.y) * -40;

		node.width = 40;
		node.height = 40;

		node.scale = 1;
		node.opacity = 0;
		cc.tween(node)
			.to(1, { y: view.y * -40, opacity: 255 }, { easing: "bounceOut" })
			.start();

		this.tiles.set(view.id, view);
	}

	private OnMoveTile(oldPosition: Position, newPosition: Position) {
		const tile = this.tiles.get(oldPosition.toString()) as TileView;

		tile.id = newPosition.toString();
		tile.x = newPosition.x;
		tile.y = newPosition.y;

		this.tiles.delete(oldPosition.toString());
		this.tiles.set(newPosition.toString(), tile);
		const node = tile.node;
		cc.tween(node)
			.to(1, { x: tile.x * 40, y: tile.y * -40 }, { easing: "bounceOut" })
			.start();

	}
}
