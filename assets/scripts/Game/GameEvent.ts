import { EnumType } from '../Utilities';

const GameEvent = cc.Enum({
	None: 0,

	Input: 5,

	TileTap: 10,
	UpdateScore: 11,
	UpdateTurns: 12,
	UpdateBonusInfo: 13,

	Bonus: 20,

	ToggleFinalScreen: 24,
	FinalScreenData: 25,
});

export default GameEvent;

export type GameEventEnum = EnumType<typeof GameEvent>;