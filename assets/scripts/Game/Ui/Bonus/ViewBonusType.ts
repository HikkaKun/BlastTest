import BonusType from '../../../Model/BonusType';
import { EnumType } from '../../../Utilities';


export const ViewBonusType = cc.Enum({
	Swap: BonusType.Swap
});

export type ViewBonusTypeEnum = EnumType<typeof ViewBonusType>;