import { EnumType } from '../../Utilities'

export const GameOjbectType = cc.Enum({
	None: 0,

	Tile: 1,
})

export type GameOjbectTypeEnum = EnumType<typeof GameOjbectType>;