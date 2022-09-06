import { randomEnumKey } from '../Utilities';
import Color from './Color'

export interface TileConfig {
	color?: Color;
}

export default class Tile {
	public color: Color;

	constructor(config?: TileConfig) {
		this.color = config?.color || randomEnumKey(Color);
	}
}