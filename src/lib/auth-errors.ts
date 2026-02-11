export function friendlyError(msg: string): string {
	if (!msg) return "Something went wrong. Please try again.";
	if (msg.includes("Invalid") || msg.includes("credentials"))
		return "Invalid email or password. Please try again.";
	if (msg.includes("exists") || msg.includes("duplicate"))
		return "An account with this email already exists. Try signing in instead.";
	if (msg.includes("network") || msg.includes("fetch"))
		return "Connection error. Please check your internet and try again.";
	if (msg.includes("expired") || msg.includes("used"))
		return "This link has expired or has already been used. Please request a new one.";
	if (msg.includes("rate") || msg.includes("Too many")) {
		// Try to extract "Try again in X minutes" from the message
		const minutesMatch = msg.match(/Try again in (\d+) minute/);
		if (minutesMatch) {
			return `Too many attempts. Try again in ${minutesMatch[1]} minute${minutesMatch[1] === "1" ? "" : "s"}.`;
		}
		return "Too many attempts. Please wait a few minutes and try again.";
	}
	return msg;
}
