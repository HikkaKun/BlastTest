import Color from '../Model/Color'

export const ViewColor = cc.Enum({
	Blue: Color.Blue,
	Green: Color.Green,
	Purple: Color.Purple,
	Red: Color.Red,
	Yellow: Color.Yellow
});

export type ViewColorEnum = typeof ViewColor[keyof typeof ViewColor];