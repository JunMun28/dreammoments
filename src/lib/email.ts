const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "DreamMoments <noreply@dreammoments.app>";

// Brand colors for email templates
const PEACH = "#FFB7B2";
const SAGE = "#E8EFE8";
const INK = "#292524";
const MUTED = "#5C5856";
const BG = "#FDFCF8";

function getApiKey(): string | undefined {
	return process.env.RESEND_API_KEY;
}

export async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
	const apiKey = getApiKey();

	if (!apiKey) {
		console.warn("[email] RESEND_API_KEY not set — skipping email send to", to);
		return { success: false, error: "No API key configured" };
	}

	try {
		const res = await fetch(RESEND_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
		});

		if (!res.ok) {
			const body = await res.text();
			console.error("[email] Resend API error:", res.status, body);
			return { success: false, error: `Resend API ${res.status}` };
		}

		const data = (await res.json()) as { id: string };
		return { success: true, id: data.id };
	} catch (err) {
		console.error("[email] Failed to send email:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
}

function emailLayout(content: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Outfit',Helvetica,Arial,sans-serif;color:${INK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:24px;border:1px solid #E7E5E4;overflow:hidden;">
        <!-- Header -->
        <tr><td style="padding:32px 32px 0;text-align:center;">
          <p style="font-size:24px;font-weight:600;letter-spacing:-0.025em;margin:0 0 4px;">DreamMoments</p>
          <div style="height:2px;width:40px;background:${PEACH};margin:0 auto;border-radius:1px;"></div>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:24px 32px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:${SAGE};text-align:center;">
          <p style="margin:0;font-size:12px;color:${MUTED};">DreamMoments &mdash; Your love story, softly told.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, name: string) {
	const displayName = name || "there";
	const html = emailLayout(`
    <h1 style="font-size:22px;font-weight:600;letter-spacing:-0.025em;margin:0 0 16px;">Welcome, ${displayName}!</h1>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:0 0 20px;">
      We're so happy you're here. DreamMoments helps you create a warm, beautiful
      wedding invitation your guests will love.
    </p>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:0 0 24px;">
      Pick a template, personalize your details, publish your page, and start
      collecting RSVPs &mdash; all in minutes.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://dreammoments.app/dashboard"
           style="display:inline-block;padding:14px 28px;background:${INK};color:#FFFFFF;
                  border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;
                  letter-spacing:0.05em;text-transform:uppercase;">
          Go to Dashboard
        </a>
      </td></tr>
    </table>
  `);

	return sendEmail({
		to: email,
		subject: "Welcome to DreamMoments!",
		html,
	});
}

export async function sendRsvpNotificationEmail(
	coupleEmail: string,
	guestName: string,
	invitationTitle: string,
	attendance: string | null | undefined,
) {
	const statusLabel =
		attendance === "attending"
			? "Attending"
			: attendance === "not_attending"
				? "Not Attending"
				: "Undecided";

	const statusColor =
		attendance === "attending"
			? "#22c55e"
			: attendance === "not_attending"
				? "#ef4444"
				: "#eab308";

	const html = emailLayout(`
    <h1 style="font-size:22px;font-weight:600;letter-spacing:-0.025em;margin:0 0 16px;">New RSVP for your invitation</h1>
    <p style="font-size:15px;line-height:1.7;color:${MUTED};margin:0 0 20px;">
      Someone just responded to <strong style="color:${INK};">${invitationTitle || "your invitation"}</strong>.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};border-radius:16px;border:1px solid #E7E5E4;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;color:${MUTED};">Guest</p>
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;">${guestName}</p>
        <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;color:${MUTED};">Status</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:${statusColor};">${statusLabel}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://dreammoments.app/dashboard"
           style="display:inline-block;padding:14px 28px;background:${INK};color:#FFFFFF;
                  border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;
                  letter-spacing:0.05em;text-transform:uppercase;">
          View All RSVPs
        </a>
      </td></tr>
    </table>
  `);

	return sendEmail({
		to: coupleEmail,
		subject: `New RSVP: ${guestName} — ${statusLabel}`,
		html,
	});
}
