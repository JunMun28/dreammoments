import BlushRomanceInvitation from './blush-romance/BlushRomanceInvitation'
import LoveAtDuskInvitation from './love-at-dusk/LoveAtDuskInvitation'
import GardenRomanceInvitation from './garden-romance/GardenRomanceInvitation'
import EternalEleganceInvitation from './eternal-elegance/EternalEleganceInvitation'
import type { TemplateInvitationProps } from './types'

export default function InvitationRenderer({
	templateId,
	...props
}: TemplateInvitationProps & { templateId: string }) {
	if (templateId === 'garden-romance') {
		return <GardenRomanceInvitation {...props} />
	}
	if (templateId === 'eternal-elegance') {
		return <EternalEleganceInvitation {...props} />
	}
	if (templateId === 'blush-romance') {
		return <BlushRomanceInvitation {...props} />
	}
	return <LoveAtDuskInvitation {...props} />
}
