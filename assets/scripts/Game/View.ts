import BlockConfig from './BlockConfig';
import BlastGame, { BlastGameConfig, BlastGameCallbacks, Position } from '../Model/BlastGame';
import Color from '../Model/Color';

const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {
	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];

	public blocks = new Map<Color, cc.SpriteFrame>;

	public game!: BlastGame;

	public onLoad() {
		for (const blockConfig of this.blockConfigs) {
			this.blocks.set(blockConfig.color as Color, blockConfig.spriteFrame);
		}

		const config: BlastGameConfig = {
			width: 9,
			height: 9,
			winScore: 25,
			turnsNumber: 10
		};
		const callbacks: BlastGameCallbacks = {
			OnDestroyTile: (position) => this.OnDestroyTile(position),
			OnGenerateTile: (forPosition, fromOutside) => this.OnGenerateTile(forPosition, fromOutside),
			OnMoveTile: (oldPosition, newPosition) => this.OnMoveTile(oldPosition, newPosition)
		};

		this.game = new BlastGame(config, callbacks);
	}

	private OnDestroyTile(position: Position) {

	}

	private OnGenerateTile(forPosition: Position, fromOutside: boolean) {

	}

	private OnMoveTile(oldPosition: Position, newPosition: Position) {

	}
}
