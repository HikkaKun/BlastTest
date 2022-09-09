import { randomEnumKey } from '../Utilities';
import Color from './Color'

export interface TileConfig {
	color?: Color;
	index: number;
}

export default class Tile {
	public color: Color;
	public index: number;

	constructor(config: TileConfig) {
		this.color = config?.color ?? randomEnumKey(Color);
		this.index = config.index;
	}
}