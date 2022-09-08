import { EnumType } from '../Utilities';

const GameEvent = cc.Enum({
	None: 0,

	Input: 5,

	TileTap: 10,
});

export default GameEvent;

export type GameEventEnum = EnumType<typeof GameEvent>;