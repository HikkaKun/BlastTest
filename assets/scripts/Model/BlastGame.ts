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
	constructor(config: BlastGameConfig) {

	}
}