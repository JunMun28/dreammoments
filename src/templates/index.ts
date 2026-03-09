import { classicalChineseTemplate } from "./classical-chinese";
import { doubleHappinessTemplate } from "./double-happiness";
import { neoBrutalismTemplate } from "./neo-brutalism";
import { romanticCinematicTemplate } from "./romantic-cinematic";
import { superdesignTemplates } from "./superdesign";

export const templates = [
	doubleHappinessTemplate,
	classicalChineseTemplate,
	romanticCinematicTemplate,
	neoBrutalismTemplate,
	...superdesignTemplates,
];

export {
	classicalChineseTemplate,
	doubleHappinessTemplate,
	neoBrutalismTemplate,
	romanticCinematicTemplate,
	superdesignTemplates,
};
