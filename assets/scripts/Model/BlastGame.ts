import { randomEnumKey, shuffleArray } from '../Utilities';
import BonusType from './BonusType';
import { Color, ColorsCount } from './Color';
import Tile from './Tile';

export interface BlastGameConfig {
	width: number;
	height: number;
	colors?: number;
	minTilesGroupSize?: number;
	shuffles?: number;
	winScore: number;
	turnsNumber: number;
	swaps?: number;

	boosterRadius?: number;
	minSuperTileGroupSize?: number;

	bombChance?: number;
}

export interface BlastGameCallbacks {
	OnDestroyTile: (position: Position) => void;
	OnMoveTile: (oldPosition: Position, newPosition: Position) => void;
	OnGenerateTile: (forPosition: Position, fromOutside: boolean) => void;
	OnTurn: (turns: number) => void;
	OnLose: () => void;
	OnWin: () => void;
	OnChangeScore: (score: number) => void;
	OnShuffle: (oldPositions: Array<Position>, newPositions: Array<Position>) => void;
	OnUpdateBonusInfo: (type: BonusType, count: number) => void;
}

export class Position {
	public readonly x: number;
	public readonly y: number;

	protected readonly _toStringResult: string;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;

		this._toStringResult = `${this.x}.${this.y}`
	}

	toString(): string {
		return this._toStringResult;
	}
}

export default class BlastGame {

	public get width() {
		return this._width;
	}

	public get height() {
		return this._height;
	}

	public get field() {
		return this._field.map(tile => tile == null ? null : Object.assign({}, tile));
	}

	public get turns() {
		return this._turns;
	}

	protected set turns(value) {
		this._turns = value;
		this.OnTurn(this._turns);

		if (this._turns == 0) {
			this._lose();
		}
	}

	public get winScore() {
		return this._winScore;
	}

	public get score() {
		return this._score;
	}

	protected set score(value) {
		this._score = value;
		this.OnChangeScore(this._score);

		if (this._score >= this._winScore) {
			this._win();
		}
	}

	public get swaps() {
		return this._swaps;
	}

	public set swaps(value) {
		this._swaps = value;
		this.OnUpdateBonusInfo(BonusType.Swap, value);
	}

	protected _width;
	protected _height;
	protected _field: Array<Tile | null>;
	protected _minTileGroupSize: number;
	protected _colors: number;
	protected _shuffles: number;
	protected _turns: number;
	protected _winScore: number;
	protected _score = 0;
	protected _canMakeTurns = true;
	protected _swaps: number;
	protected _bombChance: number;
	protected _boosterRadius: number;
	protected _minSuperTileGroupSize: number;

	protected OnDestroyTile: (position: Position) => void;
	protected OnMoveTile: (oldPosition: Position, newPosition: Position) => void;
	protected OnGenerateTile: (forPosition: Position, fromOutside: boolean) => void;
	protected OnTurn: (turns: number) => void;
	protected OnLose: () => void;
	protected OnWin: () => void;
	protected OnChangeScore: (score: number) => void;
	protected OnShuffle: (oldPositions: Array<Position>, newPositions: Array<Position>) => void;
	protected OnUpdateBonusInfo: (type: BonusType, count: number) => void;

	constructor(config: BlastGameConfig, callbacks: BlastGameCallbacks) {
		this._field = new Array<Tile>();
		this._field.length = config.width * config.height;
		this._width = config.width;
		this._height = config.height;
		this._minTileGroupSize = config.minTilesGroupSize || 2;
		this._colors = config.colors || 5;
		this._shuffles = config.shuffles ?? 1;
		this._turns = config.turnsNumber;
		this._winScore = config.winScore;
		this._swaps = config.swaps ?? 0;
		this._bombChance = config.bombChance ?? 0.01;
		this._boosterRadius = config.boosterRadius ?? 2;
		this._minSuperTileGroupSize = config.minSuperTileGroupSize ?? 6;

		this.OnDestroyTile = callbacks.OnDestroyTile;
		this.OnMoveTile = callbacks.OnMoveTile;
		this.OnGenerateTile = callbacks.OnGenerateTile;
		this.OnTurn = callbacks.OnTurn;
		this.OnWin = callbacks.OnWin;
		this.OnLose = callbacks.OnLose;
		this.OnChangeScore = callbacks.OnChangeScore;
		this.OnShuffle = callbacks.OnShuffle;
		this.OnUpdateBonusInfo = callbacks.OnUpdateBonusInfo;
	}

	public indexFromPosition(x: number, y: number): number | null {
		if (!this.checkBounds(x, y)) return null;

		return x % this._width + y * this._width;
	}

	public positionFromIndex(index: number): Position | null {
		const x = index % this.width;
		const y = Math.floor(index / this.width);

		if (!this.checkBounds(x, y)) return null;

		return new Position(x, y);
	}

	public initField(minGroups = 1): void {
		const field = this._field;

		for (let i = 0; i < field.length; i++) {
			field[i] = this._generateTile(i);
			this.OnGenerateTile(this.positionFromIndex(i) as Position, true);
		}

		while (this._findNumberOfGroups() < minGroups) {
			this._shuffle();
		}
	}

	public getTileAt(x: number, y: number): Tile | null {
		const index = this.indexFromPosition(x, y);
		return index == null ? null : this._field[index];
	}

	public checkBounds(x: number, y: number): Boolean {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	public tapAt(x: number, y: number): void {
		if (!this._canMakeTurns) return;
		if (!this.checkBounds(x, y)) return;
		if (this.turns == 0) return;

		const tile = this.getTileAt(x, y) as Tile;

		if (this._isTileBonus(tile)) {
			this._activateBonus(tile);

			for (let i = 0; i < this.width; i++) {
				this._updateColumn(i);
			}
			return;
		}

		const tilePositions = this.findGroup(x, y);

		if (tilePositions.length < this._minTileGroupSize) return;

		if (tilePositions.length >= this._minSuperTileGroupSize) {
			const position = new Position(x, y);
			const posIndex = position.toString();

			tilePositions.splice(tilePositions.indexOf(tilePositions.filter(tile => tile.toString() == posIndex)[0]), 1);

			this.OnDestroyTile(position);

			const index = this.indexFromPosition(x, y) as number;

			this._field[index] = this._generateSuperTile(index);

			this.OnGenerateTile(position, false);
		}

		this._destroyTilesAt(tilePositions);

		for (let i = 0; i < this.width; i++) {
			this._updateColumn(i);
		}

		this.turns--;

		let groups = this._findNumberOfGroups();

		if (groups != 0) return;

		for (let i = 0; i < this._shuffles; i++) {
			this._shuffle();

			groups = this._findNumberOfGroups();

			if (groups != 0) return;
		}

		for (const tile of this._field) {
			if (tile && tile.color == Color.Bomb) return;
		}

		if (this.swaps > 0) return;

		this._lose();
	}

	public findGroup(x: number, y: number, checkFunc?: (tileA: Tile, tileB: Tile) => boolean): Array<Position> {
		if (!this.checkBounds(x, y)) return [];
		if (!checkFunc) {
			checkFunc = (tileA, tileB) => tileA.color == tileB.color;
		}

		const tilePositions = new Array<Position>;

		const start = new Position(x, y);

		const frontier = new Array<Position>;
		frontier.push(start)
		const visited = new Set<string>;
		visited.add(start.toString());
		tilePositions.push(start);

		while (frontier.length) {
			const current = frontier.shift() as Position;
			const neighbors = this._getNeighbors(current.x, current.y)
			for (const next of neighbors) {
				const tileA = this.getTileAt(current.x, current.y);
				const tileB = this.getTileAt(next.x, next.y);

				if (!tileA || !tileB) continue;
				if (!checkFunc(tileA, tileB)) continue;
				if (visited.has(next.toString())) continue;

				frontier.push(next);
				visited.add(next.toString());
				tilePositions.push(next);
			}
		}

		return tilePositions;
	}

	protected _findNumberOfGroups(): number {
		const checked = new Set<string>();
		let groupsCount = 0;

		for (let i = 0; i < this._field.length; i++) {

			let isNewGroup = false;
			const current = this.positionFromIndex(i) as Position;

			const group = this.findGroup(current.x, current.y)

			if (group.length < this._minTileGroupSize) continue;

			for (const pos of group) {

				const str = pos.toString()
				if (checked.has(str)) continue;

				checked.add(str);

				isNewGroup = true;
			}

			if (isNewGroup) groupsCount++;
		}

		return groupsCount;
	}

	protected _getNeighbors(x: number, y: number): Array<Position> {
		const neighbors = new Array<Position>;

		const indexX = [0, 1, 0, -1];
		const indexY = [-1, 0, 1, 0];

		for (let i = 0; i < 4; i++) {
			const neighborX = x + indexX[i];
			const neighborY = y + indexY[i];

			if (!this.getTileAt(neighborX, neighborY)) continue;

			const position = new Position(neighborX, neighborY);
			neighbors.push(position);
		}

		return neighbors;
	}

	protected _generateTile(index: number): Tile {
		return new Tile({
			index: index,
			color: Math.random() <= this._bombChance ? Color.Bomb : randomEnumKey(Color, Math.min(this._colors, ColorsCount)),
		});
	}

	protected _destroyTilesAt(tilePositions: Array<Position>): void {
		this.score += this._pointsForTiles(tilePositions);

		for (let i = 0; i < tilePositions.length; i++) {
			const position = tilePositions[i];
			const { x, y } = position;
			const index = this.indexFromPosition(x, y) as number;

			const tile = this.getTileAt(x, y);
			if (tile != null) {
				if (this._isTileBonus(tile)) {
					this._activateBonus(tile);
				}

				this._field[index] = null;

				this.OnDestroyTile(position);
			}
		}
	}

	protected _updateColumn(x: number): void {
		let bottomEmptyY = this.height - 1;

		while (this.getTileAt(x, bottomEmptyY) != null) {
			bottomEmptyY--;
		}

		if (bottomEmptyY == -1) return;

		const tiles = new Array<Tile>;

		let y: number;

		for (y = bottomEmptyY - 1; y >= 0; y--) {
			const tile = this.getTileAt(x, y)
			if (tile != null) {
				tiles.push(tile);
				const index = this.indexFromPosition(x, y) as number;
				this._field[index] = null;
			}
		}

		y = bottomEmptyY;

		while (y >= 0) {
			const index = this.indexFromPosition(x, y) as number;
			if (tiles.length > 0) {
				const tile = tiles.shift() as Tile;
				this._field[index] = tile;
				this.OnMoveTile(this.positionFromIndex(tile.index) as Position, new Position(x, y));
				tile.index = index;
			} else {
				this._field[index] = this._generateTile(index);
				this.OnGenerateTile(this.positionFromIndex(index) as Position, true);
			}

			y--;
		}
	}

	public swap(x1: number, y1: number, x2: number, y2: number): void {
		if (this.swaps <= 0) return;

		const index1 = this.indexFromPosition(x1, y1);
		const index2 = this.indexFromPosition(x2, y2);

		if (index1 == null || index2 == null || index1 == index2) return;

		[this._field[index1], this._field[index2]] = [this._field[index2], this._field[index1]];

		const tile1 = this._field[index1] as Tile;
		tile1.index = index1;

		const tile2 = this._field[index2] as Tile;
		tile2.index = index2;

		this.OnMoveTile(this.positionFromIndex(index1) as Position, this.positionFromIndex(index2) as Position);
		this.swaps--;
	}

	protected _shuffle(): void {
		const oldPositions = Array<Position>();
		const newPositions = Array<Position>();

		shuffleArray(this._field);

		for (let i = 0; i < this._field.length; i++) {
			const tile = this._field[i] as Tile;

			oldPositions.push(this.positionFromIndex(tile.index) as Position);
			tile.index = i;
			newPositions.push(this.positionFromIndex(i) as Position);
		}

		this.OnShuffle(oldPositions, newPositions);
	}

	protected _pointsForTiles(tilePositions: Array<Position>): number {
		let points = 0;

		for (const position of tilePositions) {
			points += this.getTileAt(position.x, position.y)?.points ?? 0;
		}

		return points;
	}

	protected _lose(): void {
		if (!this._canMakeTurns) return;

		this._canMakeTurns = false;
		this.OnLose();
	}

	protected _win(): void {
		if (!this._canMakeTurns) return;

		this._canMakeTurns = false;
		this.OnWin();
	}

	protected _explodeAt(x: number, y: number, radius: number): void {
		const tilePositions = this.findGroup(x, y, (tileA, tileB) => {
			const pos = this.positionFromIndex(tileB.index) as Position;
			return (pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y) <= radius * radius
		});

		this._destroyTilesAt(tilePositions);
	}

	protected _generateSuperTile(index: number): Tile {
		const types = [Color.Bomb, Color.SuperVertical, Color.SuperHorizontal, Color.SuperAll];

		return new Tile({
			index: index,
			color: types[Math.floor(Math.random() * types.length)],
		});
	}

	protected _destroyRow(y: number): void {
		this._destroyTilesAt(this._getTileLine(0, y, this.width - 1, y));
	}

	protected _destroyColumn(x: number): void {
		this._destroyTilesAt(this._getTileLine(x, 0, x, this._height - 1));
	}

	protected _destroyAll(): void {
		const tilePositions = Array<Position>();
		for (let i = 0; i < this._field.length; i++) {
			tilePositions.push(this.positionFromIndex(i) as Position);
		}

		this._destroyTilesAt(tilePositions);
	}

	protected _getTileLine(x1: number, y1: number, x2: number, y2: number): Array<Position> {
		if (!this.checkBounds(x1, y1)) return [];
		if (!this.checkBounds(x2, y2)) return [];

		const tilePositions = Array<Position>();

		const dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
		const dy = Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1;
		let err = (dx > dy ? dx : -dy) / 2;

		while (true) {
			tilePositions.push(new Position(x1, y1));
			if (x1 === x2 && y1 === y2) break;

			if (err > -dx) { err -= dy; x1 += sx; }
			if (err < dy) { err += dx; y1 += sy; }
		}

		return tilePositions;
	}

	protected _isTileBonus(tile: Tile): boolean {
		return tile.color >= ColorsCount;
	}

	protected _activateBonus(bonus: Tile): void {
		if (!this._isTileBonus(bonus) || bonus.isActivated) return;

		const { x, y } = this.positionFromIndex(bonus.index) as Position;
		bonus.isActivated = true;

		switch (bonus.color) {
			case Color.Bomb:
				this._explodeAt(x, y, this._boosterRadius);
				this.turns--;
				break;
			case Color.SuperHorizontal:
				this._destroyRow(y);
				this.turns--;
				break;
			case Color.SuperVertical:
				this._destroyColumn(x);
				this.turns--;
				break;
			case Color.SuperAll:
				this._destroyAll()
				this.turns--;
				break;
		}
	}
}
