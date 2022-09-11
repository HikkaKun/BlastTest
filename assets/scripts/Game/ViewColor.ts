import { Color } from '../Model/Color'
import { EnumType } from '../Utilities';

export const ViewColor = cc.Enum({
	Blue: Color.Blue,
	Green: Color.Green,
	Purple: Color.Purple,
	Red: Color.Red,
	Yellow: Color.Yellow,
	Bomb: Color.Bomb
});

export type ViewColorEnum = EnumType<typeof ViewColor>;