export const InputDirection = cc.Enum({
	None: 0,
	Tile: 1
});

export type InputDirectionEnum = typeof InputDirection[keyof typeof InputDirection];