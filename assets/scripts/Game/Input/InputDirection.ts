import { EnumType } from '../../Utilities';

export const InputDirection = cc.Enum({
	None: 0,
	Tile: 1
});

export type InputDirectionEnum = EnumType<typeof InputDirection>;