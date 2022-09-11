import { randomEnumKey } from '../Utilities';
import { Color, ColorsCount } from './Color'

export interface TileConfig {
	color?: Color;
	points?: number;
	index: number;
}

export default class Tile {
	public color: Color;
	public index: number;
	public points: number;
	public isActivated = false;

	constructor(config: TileConfig) {
		this.color = config?.color ?? randomEnumKey(Color, ColorsCount);
		this.points = config?.points || 10;
		this.index = config.index;
	}
}