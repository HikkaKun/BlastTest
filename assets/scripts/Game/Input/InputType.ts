export const InputType = cc.Enum({
	Down: 0,
	Move: 1,
	Up: 2
});

export type InputTypeEnum = typeof InputType[keyof typeof InputType]; 