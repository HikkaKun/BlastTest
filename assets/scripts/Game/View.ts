import BlockConfig from './BlockConfig';
import BlastGame, { BlastGameConfig } from '../Model/BlastGame';

const { ccclass, property } = cc._decorator;

@ccclass
export default class View extends cc.Component {
	@property([BlockConfig])
	public blockConfigs: Array<BlockConfig> = [];


}
