import { randomEnumKey, shuffleArray } from '../Utilities';
import BonusType from './BonusType';
import Color from './Color';
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

	private readonly _toStringResult: string;

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

	private set turns(value) {
		this._turns = value;
		this.OnTurn(this._turns);

		if (this._turns == 0) {
			this._lose();
		}
	}

	public get score() {
		return this._score;
	}

	private set score(value) {
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

	private _width;
	private _height;
	private _field: Array<Tile | null>;
	private _minTileGroupSize: number;
	private _colors: number;
	private _shuffles: number;
	private _turns: number;
	private _winScore: number;
	private _score = 0;
	private _canMakeTurns = true;
	private _swaps: number;

	private OnDestroyTile: (position: Position) => void;
	private OnMoveTile: (oldPosition: Position, newPosition: Position) => void;
	private OnGenerateTile: (forPosition: Position, fromOutside: boolean) => void;
	private OnTurn: (turns: number) => void;
	private OnLose: () => void;
	private OnWin: () => void;
	private OnChangeScore: (score: number) => void;
	private OnShuffle: (oldPositions: Array<Position>, newPositions: Array<Position>) => void;
	private OnUpdateBonusInfo: (type: BonusType, count: number) => void;

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

	public tileAt(x: number, y: number): Tile | null {
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

		const tiles = this.findGroup(x, y);

		if (tiles.length < this._minTileGroupSize) return;

		this.score += this._pointsForTiles(tiles);
		this._destroyTiles(tiles);

		this.turns--;

		if (this.turns == 0) return;
		if (this._findNumberOfGroups() != 0) return;

		for (let i = 0; i < this._shuffles; i++) {
			this._shuffle();
		}

		if (this._findNumberOfGroups() == 0) this._lose();
	}

	public findGroup(x: number, y: number): Array<Position> {
		if (!this.checkBounds(x, y)) return [];

		const tiles = new Array<Position>;

		const pickedColor = this.tileAt(x, y)?.color as Color;
		const start = new Position(x, y);

		const frontier = new Array<Position>;
		frontier.push(start)
		const visited = new Set<string>;
		visited.add(start.toString());
		tiles.push(start);

		while (frontier.length) {
			const current = frontier.shift() as Position;
			const neighbors = this._getNeighbors(current.x, current.y)
			for (const next of neighbors) {
				if (this.tileAt(next.x, next.y)?.color != pickedColor) continue;
				if (visited.has(next.toString())) continue;

				frontier.push(next);
				visited.add(next.toString());
				tiles.push(next);
			}
		}

		return tiles;
	}

	private _findNumberOfGroups(): number {
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

	private _getNeighbors(x: number, y: number): Array<Position> {
		const neighbors = new Array<Position>;

		const indexX = [0, 1, 0, -1];
		const indexY = [-1, 0, 1, 0];

		for (let i = 0; i < 4; i++) {
			const neighborX = x + indexX[i];
			const neighborY = y + indexY[i];

			if (!this.tileAt(neighborX, neighborY)) continue;

			const position = new Position(neighborX, neighborY);
			neighbors.push(position);
		}

		return neighbors;
	}

	private _generateTile(index: number): Tile {
		return new Tile({
			index: index,
			color: randomEnumKey(Color, this._colors)
		});
	}

	private _destroyTiles(tiles: Array<Position>): void {
		const columnsToUpdate = new Set<number>;

		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];
			const { x, y } = tile;
			const index = this.indexFromPosition(x, y) as number;

			this._field[index] = null;

			this.OnDestroyTile(tile);

			columnsToUpdate.add(x);
		}

		columnsToUpdate.forEach((x) => {
			this._updateColumn(x);
		})
	}

	private _updateColumn(x: number): void {
		let bottomEmptyY = this.height - 1;

		while (this.tileAt(x, bottomEmptyY) != null) {
			bottomEmptyY--;
		}

		if (bottomEmptyY == -1) return;

		const tiles = new Array<Tile>;

		let y: number;

		for (y = bottomEmptyY - 1; y >= 0; y--) {
			const tile = this.tileAt(x, y)
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
		const index1 = this.indexFromPosition(x1, y1);
		const index2 = this.indexFromPosition(x2, y2);

		if (index1 == null || index2 == null || index1 == index2) return;

		[this._field[index1], this._field[index2]] = [this._field[index2], this._field[index1]];

		this.OnMoveTile(this.positionFromIndex(index1) as Position, this.positionFromIndex(index2) as Position);
	}

	private _shuffle(): void {
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

	private _pointsForTiles(positions: Array<Position>): number {
		let points = 0;

		for (const pos of positions) {
			points += this.tileAt(pos.x, pos.y)?.points ?? 0;
		}

		return points;
	}

	private _lose(): void {
		if (!this._canMakeTurns) return;

		this._canMakeTurns = false;
		this.OnLose();
	}

	private _win(): void {
		if (!this._canMakeTurns) return;

		this._canMakeTurns = false;
		this.OnWin();
	}
}
