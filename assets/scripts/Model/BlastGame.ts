import { randomEnumKey } from '../Utilities';
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

	boosterRadius?: number;
	minSuperTileGroupSize?: number;
}

export interface BlastGameCallbacks {
	OnDestroyTile: (position: Position) => void;
	OnMoveTile: (oldPosition: Position, newPosition: Position) => void;
	OnGenerateTile: (forPosition: Position, fromOutside: boolean) => void;
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

	private _width;
	private _height;
	private _field: Array<Tile | null>;
	private _minTileGroupSize: number;
	private _colors: number;

	private OnDestroyTile: (position: Position) => void;
	private OnMoveTile: (oldPosition: Position, newPosition: Position) => void;
	private OnGenerateTile: (forPosition: Position, fromOutside: boolean) => void;

	constructor(config: BlastGameConfig, callbacks: BlastGameCallbacks) {
		this._field = new Array<Tile>();
		this._field.length = config.width * config.height;
		this._width = config.width;
		this._height = config.height;
		this._minTileGroupSize = config.minTilesGroupSize || 2;
		this._colors = config.colors || 5;

		this.OnDestroyTile = callbacks.OnDestroyTile;
		this.OnMoveTile = callbacks.OnMoveTile;
		this.OnGenerateTile = callbacks.OnGenerateTile;
	}

	public indexFromPosition(x: number, y: number): number | null {
		if (!this.checkBounds(x, y)) return null;

		return x % this._width + y * this._height;
	}

	public positionFromIndex(index: number): Position | null {
		const x = index % this.width;
		const y = Math.floor(index / this.height);

		if (!this.checkBounds(x, y)) return null;

		return new Position(x, y);
	}

	public initField(): void {
		const field = this._field;

		for (let i = 0; i < field.length; i++) {
			field[i] = this._generateTile();
			this.OnGenerateTile(this.positionFromIndex(i) as Position, true);
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
		if (!this.checkBounds(x, y)) return;

		const tiles = this.findGroup(x, y);

		if (tiles.length < this._minTileGroupSize) return;

		this._destroyTiles(tiles);
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

	private _generateTile(): Tile {
		return new Tile({ color: randomEnumKey(Color, this._colors) });
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

		const tiles = new Array<{ oldPosition: Position, tile: Tile }>;

		let y: number;

		for (y = bottomEmptyY - 1; y >= 0; y--) {
			const tile = this.tileAt(x, y)
			if (tile != null) {
				tiles.push({ oldPosition: new Position(x, y), tile });
				const index = this.indexFromPosition(x, y) as number;
				this._field[index] = null;
			}
		}

		y = bottomEmptyY;

		while (y >= 0) {
			const index = this.indexFromPosition(x, y) as number;
			if (tiles.length > 0) {
				const oldTile = tiles.shift() as { oldPosition: Position, tile: Tile };
				this._field[index] = oldTile.tile;
				this.OnMoveTile(oldTile.oldPosition, new Position(x, y));
			} else {
				this._field[index] = this._generateTile();
				this.OnGenerateTile(this.positionFromIndex(index) as Position, true);
			}

			y--;
		}
	}

	private _swap(x1: number, y1: number, x2: number, y2: number): void {
		const index1 = this.indexFromPosition(x1, y1);
		const index2 = this.indexFromPosition(x2, y2);

		if (index1 == null || index2 == null) return;

		[this._field[index1], this._field[index2]] = [this._field[index2], this._field[index1]];
	}
}
