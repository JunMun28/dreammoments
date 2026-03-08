import { createFileRoute } from "@tanstack/react-router";
import InvitationRenderer from "../../components/templates/InvitationRenderer";
import { buildSampleContent } from "../../data/sample-invitation";
import { templates } from "../../templates";

export const Route = createFileRoute("/preview/$templateId")({
	component: TemplatePreview,
});

function TemplatePreview() {
	const { templateId } = Route.useParams();
	const content = buildSampleContent(templateId);
	const template = templates.find((t) => t.id === templateId);

	if (!template) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p>Template "{templateId}" not found.</p>
			</div>
		);
	}

	return (
		<InvitationRenderer
			templateId={templateId}
			content={content}
			hiddenSections={{}}
		/>
	);
}
