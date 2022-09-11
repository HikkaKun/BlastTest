import BlockConfig from './BlockConfig';
import BlastGame, { BlastGameConfig, BlastGameCallbacks, Position } from '../Model/BlastGame';
import Color from '../Model/Color';
import TileView from './TileView';
import GameEvent from './GameEvent';
import { GameObjectType, GameOjbectTypeEnum } from './GameObject/GameObjectType';
import GameObjectManager from './GameObject/GameObjectManager';
import BonusType from '../Model/BonusType';
import { ViewBonusType, ViewBonusTypeEnum } from './Ui/Bonus/ViewBonusType';

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

	@property({ min: 0, step: 1, max: 99 })
	public swapBonuses = 5;

	//#endregion

	//#region view settings

	@property(cc.Prefab)
	public tileViewPrefab: cc.Prefab | null = null;

	@property({ type: GameObjectType })
	public tilePrefab: GameOjbectTypeEnum = GameObjectType.None;

	@property({ min: 20 })
	public blockSize = 40;

	@property(cc.Node)
	public maskNode: cc.Node | null = null;

	@property(cc.Node)
	public background: cc.Node | null = null;

	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];

	//#endregion 


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
			OnMoveTile: (oldPosition, newPosition) => this.OnMoveTile(oldPosition, newPosition),
			OnTurn: (turns: number) => this.OnTurn(turns),
			OnLose: () => cc.log("Lose!"),
			OnWin: () => cc.log("Win!"),
			OnChangeScore: (score: number) => this.OnChangeScore(score),
			OnShuffle: (oldPositions: Array<Position>, newPositions: Array<Position>) => this.OnShuffle(oldPositions, newPositions),
			OnUpdateBonusInfo: (type: BonusType, count: number) => this.OnUpdateBonusInfo(type, count)
		};

		this.game = new BlastGame(config, callbacks);
		this.game.initField();

		if (this.maskNode) {
			this.maskNode.width = this.blockSize * (this.gameWidth + 1);
			this.maskNode.height = this.blockSize * (this.gameHeight + 1);
		}

		if (this.background) {
			this.background.width = this.blockSize * (this.gameWidth + 1) / this.background.scaleX;
			this.background.height = this.blockSize * (this.gameHeight + 1) / this.background.scaleY;
		}
	}

	protected start(): void {
		this.OnChangeScore(0);
		this.OnUpdateBonusInfo(BonusType.Swap, this.swapBonuses);
		this.OnTurn(this.turns);
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
		cc.systemEvent[func](GameEvent.Bonus, this.OnTapBonus, this);
	}

	private OnTileTap(tile: TileView): void {
		this.game.tapAt(tile.x, tile.y);
	}

	private OnDestroyTile(position: Position) {
		const tile = this.tiles.get(position.toString()) as TileView;
		tile.tweenDestroy();

		this.tiles.delete(position.toString());
	}

	private OnGenerateTile(forPosition: Position, fromOutside: boolean) {
		const node = GameObjectManager.createGameOjbect(this.tilePrefab);

		if (!node) return;

		node.parent = this.node;

		const tile = node.getComponent(TileView);
		tile.view = this;
		tile.id = forPosition.toString();
		tile.x = forPosition.x;
		tile.y = forPosition.y;

		const sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = this.blocks.get(this.game.tileAt(forPosition.x, forPosition.y)?.color as Color) as cc.SpriteFrame;

		node.x = (forPosition.x - this.gameWidth / 2 + 0.5) * this.blockSize;
		node.y = ((fromOutside ? forPosition.y - this.game.height : forPosition.y) - this.gameHeight / 2 + 0.5) * -this.blockSize;

		node.width = this.blockSize;
		node.height = this.blockSize;

		node.scale = 1;
		tile.tweenMove();

		this.tiles.set(tile.id, tile);
	}

	private OnMoveTile(oldPosition: Position, newPosition: Position) {
		const tile = this.tiles.get(oldPosition.toString()) as TileView;

		tile.id = newPosition.toString();
		tile.x = newPosition.x;
		tile.y = newPosition.y;

		this.tiles.delete(oldPosition.toString());
		this.tiles.set(newPosition.toString(), tile);

		tile.tweenMove();
	}

	private OnShuffle(oldPositions: Array<Position>, newPositions: Array<Position>) {
		const newTiles = new Map<string, TileView>();

		for (let i = 0; i < oldPositions.length; i++) {
			const tile = this.tiles.get(oldPositions[i].toString()) as TileView;

			const newPos = newPositions[i];
			tile.id = newPos.toString() as string;
			tile.x = newPos.x;
			tile.y = newPos.y;

			tile.tweenMove();

			newTiles.set(newPos.toString(), tile);
		}

		this.tiles = newTiles;
	}

	private OnChangeScore(score: number) {
		cc.systemEvent.emit(GameEvent.UpdateScore, score, this.winScore);
	}

	private OnTurn(turns: number) {
		cc.systemEvent.emit(GameEvent.UpdateTurns, turns, this.turns);
	}

	private OnUpdateBonusInfo(type: BonusType, count: number) {
		cc.systemEvent.emit(GameEvent.UpdateBonusInfo, type, count);
	}

	private OnTapBonus(type: ViewBonusTypeEnum) {
		cc.log("tapped", BonusType[type]);
	}
}
