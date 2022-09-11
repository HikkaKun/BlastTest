import { EnumType } from '../../Utilities';

export const InputDirection = cc.Enum({
	None: 0,
	Tile: 1,
	Bonus: 2,
});

export type InputDirectionEnum = EnumType<typeof InputDirection>;