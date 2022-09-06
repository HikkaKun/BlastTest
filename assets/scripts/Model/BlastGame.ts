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

export default class BlastGame {

	public get width() {
		return this._width;
	}

	public get height() {
		return this._height;
	}

	private _width;
	private _height;
	private _field: Tile[];

	constructor(config: BlastGameConfig) {
		this._field = new Array<Tile>();
		this._field.length = config.width * config.height;
		this._width = config.width;
		this._height = config.height;

		this.initField();
	}

	public initField(): void {
		const field = this._field;

		for (let i = 0; i < field.length; i++) {
			field[i] = new Tile();
		}
	}

	public tileAt(x: number, y: number): Tile | null {
		if (!this.checkBounds(x, y)) return null;

		return this._field[x % this._width + y * this._height];
	}

	public checkBounds(x: number, y: number): Boolean {
		return x > 0 && x < this.width && y > 0 && y < this.height;
	}
}