import BlastGame, { BlastGameConfig, BlastGameCallbacks, Position } from '../../Model/BlastGame';
import BonusType from '../../Model/BonusType';
import { Color } from '../../Model/Color';
import { GameEvent } from '../GameEvent';
import GameObjectManager from '../GameObject/GameObjectManager';
import { GameObjectType, GameOjbectTypeEnum } from '../GameObject/GameObjectType';
import { ViewBonusTypeEnum, ViewBonusType } from '../Ui/Bonus/ViewBonusType';
import Toggle from '../Ui/Toggle';
import BlockConfig from './BlockConfig';
import TileView from './TileView';

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

	@property({ min: 0, max: 1 })
	public bombChance = 0.01;

	//#endregion

	//#region view settings

	@property({ type: GameObjectType })
	public tilePrefab: GameOjbectTypeEnum = GameObjectType.None;

	@property({ min: 20 })
	public blockSize = 40;

	@property(cc.Node)
	public maskNode: cc.Node | null = null;

	@property(cc.Node)
	public background: cc.Node | null = null;

	@property(Toggle)
	public black: Toggle | null = null;

	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];

	//#endregion 


	public blocks = new Map<Color, cc.SpriteFrame>;

	public game!: BlastGame;

	public tiles = new Map<string, TileView>;

	public isSwapActive = false;
	public swapTile: TileView | null = null;

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
			minSuperTileGroupSize: this.minSuperTileGroupSize,
			swaps: this.swapBonuses,
			bombChance: this.bombChance,
		};
		const callbacks: BlastGameCallbacks = {
			OnDestroyTile: (position) => this.OnDestroyTile(position),
			OnGenerateTile: (forPosition, fromOutside) => this.OnGenerateTile(forPosition, fromOutside),
			OnMoveTile: (oldPosition, newPosition) => this.OnMoveTile(oldPosition, newPosition),
			OnTurn: (turns: number) => this.OnTurn(turns),
			OnLose: () => this.OnEndGame(false),
			OnWin: () => this.OnEndGame(true),
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

		this._toggleBlack(false, true);
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

	protected _handleEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		cc.systemEvent[func](GameEvent.TileTap, this.OnTileTap, this);
		cc.systemEvent[func](GameEvent.Bonus, this.OnTapBonus, this);
	}

	protected _toggleBlack(isOn: boolean, instant = false): void {
		if (!this.black) return;

		this.black.OnToggle(isOn, instant ? 0 : 0.5);

		if (!isOn) return;

		this._moveChildToTop(this.black.node);
	}

	protected _moveChildToTop(child: cc.Node) {
		this.node.removeChild(child, false);
		this.node.addChild(child);
	}

	protected OnTileTap(tile: TileView): void {
		if (this.isSwapActive) {
			switch (this.swapTile) {
				case tile:
					this.isSwapActive = false;
					this._toggleBlack(false);
					this.swapTile = null;
					break;
				case null:
					this.swapTile = tile;
					this._moveChildToTop(tile.node);
					break;
				default:
					this.isSwapActive = false;
					this._moveChildToTop(tile.node);
					this._toggleBlack(false);

					this.game.swap(this.swapTile.x, this.swapTile.y, tile.x, tile.y);
					this.swapTile = null;
					break;
			}

			return;
		}

		this.game.tapAt(tile.x, tile.y);
	}

	protected OnDestroyTile(position: Position) {
		const index = position.toString();
		const tile = this.tiles.get(index);

		if (!tile) return;

		tile.tweenDestroy();

		this.tiles.delete(index);
	}

	protected OnGenerateTile(forPosition: Position, fromOutside: boolean) {
		const node = GameObjectManager.createGameOjbect(this.tilePrefab);

		if (!node) return;

		node.parent = this.node;

		const tile = node.getComponent(TileView);
		tile.view = this;
		tile.id = forPosition.toString();
		tile.x = forPosition.x;
		tile.y = forPosition.y;

		const sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = this.blocks.get(this.game.getTileAt(forPosition.x, forPosition.y)?.color as Color) as cc.SpriteFrame;

		node.x = (forPosition.x - this.gameWidth / 2 + 0.5) * this.blockSize;
		node.y = ((fromOutside ? forPosition.y - this.game.height : forPosition.y) - this.gameHeight / 2 + 0.5) * -this.blockSize;

		node.width = this.blockSize;
		node.height = this.blockSize;

		node.scale = 1;
		tile.tweenMove();

		this.tiles.set(tile.id, tile);
	}

	protected OnMoveTile(oldPosition: Position, newPosition: Position) {
		const oldIndex = oldPosition.toString();
		const newIndex = newPosition.toString();

		const tile1 = this.tiles.get(oldIndex);
		const tile2 = this.tiles.get(newIndex);

		this.tiles.delete(oldIndex);
		this.tiles.delete(newIndex);

		if (tile1) {
			this.tiles.set(newIndex, tile1);

			tile1.id = newIndex;
			tile1.x = newPosition.x;
			tile1.y = newPosition.y;

			tile1.tweenMove();
		}

		if (tile2) {
			this.tiles.set(oldIndex, tile2);

			tile2.id = oldIndex;
			tile2.x = oldPosition.x;
			tile2.y = oldPosition.y;

			tile2.tweenMove();
		}
	}

	protected OnShuffle(oldPositions: Array<Position>, newPositions: Array<Position>) {
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

	protected OnChangeScore(score: number) {
		cc.systemEvent.emit(GameEvent.UpdateScore, score, this.winScore);
	}

	protected OnTurn(turns: number) {
		cc.systemEvent.emit(GameEvent.UpdateTurns, turns, this.turns);
	}

	protected OnUpdateBonusInfo(type: BonusType, count: number) {
		cc.systemEvent.emit(GameEvent.UpdateBonusInfo, type, count);
	}

	protected OnTapBonus(type: ViewBonusTypeEnum) {
		if (this.isSwapActive) {
			this.isSwapActive = false;
			this.swapTile = null;
			this._toggleBlack(false);

			return;
		}

		switch (type) {
			case ViewBonusType.Swap:
				if (this.game.swaps <= 0) break;

				this.isSwapActive = true;
				this._toggleBlack(true);
				break;
		}

	}

	protected OnEndGame(isWin: boolean) {
		cc.systemEvent.emit(GameEvent.ToggleFinalScreen, true);
		cc.systemEvent.emit(GameEvent.FinalScreenData, this.game.score, this.winScore, isWin);
	}
}
