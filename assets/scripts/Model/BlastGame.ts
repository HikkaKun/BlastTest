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

class Node {
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
		return this._field.slice();
	}

	private _width;
	private _height;
	private _field: Array<Tile | null>;
	private _minTileGroupSize: number;
	private _colors: number;

	constructor(config: BlastGameConfig) {
		this._field = new Array<Tile>();
		this._field.length = config.width * config.height;
		this._width = config.width;
		this._height = config.height;
		this._minTileGroupSize = config.minTilesGroupSize || 2;
		this._colors = config.colors || 5;
	}

	public fieldIndex(x: number, y: number): number | null {
		if (!this.checkBounds(x, y)) return null;

		return x % this._width + y * this._height;
	}

	public initField(): void {
		const field = this._field;

		for (let i = 0; i < field.length; i++) {
			field[i] = this._generateTile();
		}
	}

	public tileAt(x: number, y: number): Tile | null {
		const index = this.fieldIndex(x, y);
		return index == null ? null : this._field[index];
	}

	public checkBounds(x: number, y: number): Boolean {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	public tapAt(x: number, y: number): void {
		if (!this.checkBounds(x, y)) return;

		const tiles = this.findGroup(x, y);

		if (tiles.length < this._minTileGroupSize) return;

		//TODO: подумать как отправить информацию об удаленных тайлах

		this._destroyTiles(tiles);
	}

	public findGroup(x: number, y: number): Array<Node> {
		if (!this.checkBounds(x, y)) return [];

		const tiles = new Array<Node>;

		const pickedColor = this.tileAt(x, y)?.color as Color;
		const start = new Node(x, y);

		const frontier = new Array<Node>;
		frontier.push(start)
		const visited = new Set<string>;
		visited.add(start.toString());
		tiles.push(start);

		while (frontier.length) {
			const current = frontier.shift() as Node;
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

	private _getNeighbors(x: number, y: number): Array<Node> {
		const neighbors = new Array<Node>;

		const indexX = [0, 1, 0, -1];
		const indexY = [-1, 0, 1, 0];

		for (let i = 0; i < 4; i++) {
			const neighborX = x + indexX[i];
			const neighborY = y + indexY[i];

			if (!this.tileAt(neighborX, neighborY)) continue;

			const node = new Node(neighborX, neighborY);
			neighbors.push(node);
		}

		return neighbors;
	}

	private _generateTile(): Tile {
		return new Tile({ color: randomEnumKey(Color, this._colors) });
	}

	private _destroyTiles(tiles: Array<Node>): void {
		const columnsToUpdate = new Set<number>;

		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];
			const { x, y } = tile;
			const index = this.fieldIndex(x, y) as number;

			this._field[index] = null;

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
				const index = this.fieldIndex(x, y) as number;
				this._field[index] = null;
			}
		}

		y = bottomEmptyY;

		while (y >= 0) {
			const index = this.fieldIndex(x, y) as number;
			this._field[index] = tiles.shift() ?? this._generateTile();

			y--;
		}
	}

	private _swap(x1: number, y1: number, x2: number, y2: number): void {
		const index1 = this.fieldIndex(x1, y1);
		const index2 = this.fieldIndex(x2, y2);

		if (index1 == null || index2 == null) return;

		[this._field[index1], this._field[index2]] = [this._field[index2], this._field[index1]];
	}
}
