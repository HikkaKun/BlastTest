import { EnumType } from '../Utilities';

export const GameEvent = cc.Enum({
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

export type GameEventEnum = EnumType<typeof GameEvent>;