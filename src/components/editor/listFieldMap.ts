export type ListFieldConfig = {
	label: string;
	fields: Array<{ key: string; label: string }>;
};

export const listFieldMap: Record<string, ListFieldConfig> = {
	story: {
		label: "Milestones",
		fields: [
			{ key: "date", label: "Date" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	schedule: {
		label: "Events",
		fields: [
			{ key: "time", label: "Time" },
			{ key: "title", label: "Title" },
			{ key: "description", label: "Description" },
		],
	},
	faq: {
		label: "FAQ Items",
		fields: [
			{ key: "question", label: "Question" },
			{ key: "answer", label: "Answer" },
		],
	},
	gallery: {
		label: "Gallery",
		fields: [
			{ key: "url", label: "Image URL" },
			{ key: "caption", label: "Caption" },
		],
	},
	entourage: {
		label: "Entourage",
		fields: [
			{ key: "role", label: "Role" },
			{ key: "name", label: "Name" },
		],
	},
};
