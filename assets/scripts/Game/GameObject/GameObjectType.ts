import { EnumType } from '../../Utilities'

export const GameObjectType = cc.Enum({
	None: 0,

	Tile: 1,
})

export type GameOjbectTypeEnum = EnumType<typeof GameObjectType>;