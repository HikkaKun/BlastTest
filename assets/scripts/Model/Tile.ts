import { randomEnumKey } from '../Utilities';
import Color from './Color'

export interface TileConfig {
	color?: Color;
	points?: number;
	index: number;
}

export default class Tile {
	public color: Color;
	public index: number;
	public points: number;

	constructor(config: TileConfig) {
		this.color = config?.color ?? randomEnumKey(Color);
		this.points = config?.points || 10;
		this.index = config.index;
	}
}