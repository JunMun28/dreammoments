// Stripe integration using raw fetch (no npm package required).
// Env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

export interface StripeConfig {
	secretKey: string;
	webhookSecret: string;
}

/**
 * Read Stripe env vars. Returns null when STRIPE_SECRET_KEY is not set
 * (allows graceful fallback to mock payment in development).
 */
export function getStripeConfig(): StripeConfig | null {
	const secretKey = process.env.STRIPE_SECRET_KEY;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!secretKey) {
		return null;
	}

	if (!webhookSecret) {
		console.warn(
			"[Stripe] STRIPE_WEBHOOK_SECRET is not set. Webhook verification will fail.",
		);
	}

	return { secretKey, webhookSecret: webhookSecret ?? "" };
}

// ── Pricing ─────────────────────────────────────────────────────────

export const PRICING: Record<
	"MYR" | "SGD",
	{ amountCents: number; label: string }
> = {
	MYR: { amountCents: 4900, label: "RM49" },
	SGD: { amountCents: 1900, label: "$19" },
};

/** Regional payment methods supported per currency. */
const PAYMENT_METHODS: Record<"MYR" | "SGD", string[]> = {
	MYR: ["card", "fpx", "grabpay"],
	SGD: ["card", "paynow", "grabpay"],
};

// ── Checkout Session ────────────────────────────────────────────────

export interface CreateCheckoutParams {
	userId: string;
	email: string;
	currency: "MYR" | "SGD";
	invitationId?: string;
	successUrl: string;
	cancelUrl: string;
}

interface StripeCheckoutSession {
	id: string;
	url: string | null;
}

/**
 * Create a Stripe Checkout Session via the Stripe API.
 * Returns the session with its hosted checkout URL.
 */
export async function createCheckoutSession(
	config: StripeConfig,
	params: CreateCheckoutParams,
): Promise<StripeCheckoutSession> {
	const price = PRICING[params.currency];

	const methods = PAYMENT_METHODS[params.currency];
	const methodParams: Record<string, string> = {};
	for (let i = 0; i < methods.length; i++) {
		methodParams[`payment_method_types[${i}]`] = methods[i];
	}

	const body = new URLSearchParams({
		mode: "payment",
		success_url: params.successUrl,
		cancel_url: params.cancelUrl,
		customer_email: params.email,
		...methodParams,
		"line_items[0][price_data][currency]": params.currency.toLowerCase(),
		"line_items[0][price_data][unit_amount]": String(price.amountCents),
		"line_items[0][price_data][product_data][name]": "DreamMoments Premium",
		"line_items[0][price_data][product_data][description]":
			"Custom URL, 100 AI generations, CSV import/export, advanced analytics",
		"line_items[0][quantity]": "1",
		"metadata[user_id]": params.userId,
		"metadata[currency]": params.currency,
		...(params.invitationId
			? { "metadata[invitation_id]": params.invitationId }
			: {}),
		"payment_intent_data[metadata][user_id]": params.userId,
		"payment_intent_data[metadata][currency]": params.currency,
		...(params.invitationId
			? {
					"payment_intent_data[metadata][invitation_id]": params.invitationId,
				}
			: {}),
	});

	const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${config.secretKey}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Stripe API error (${response.status}): ${errorBody}`);
	}

	const session: StripeCheckoutSession = await response.json();
	return session;
}

// ── Webhook Signature Verification ──────────────────────────────────

/**
 * Verify a Stripe webhook signature (v1 scheme) using Web Crypto.
 * Returns true if the signature is valid.
 */
export async function verifyWebhookSignature(
	payload: string,
	signatureHeader: string,
	webhookSecret: string,
): Promise<boolean> {
	// Parse the Stripe-Signature header
	const parts = signatureHeader.split(",");
	let timestamp = "";
	const signatures: string[] = [];

	for (const part of parts) {
		const [key, value] = part.trim().split("=");
		if (key === "t") timestamp = value;
		if (key === "v1") signatures.push(value);
	}

	if (!timestamp || signatures.length === 0) {
		return false;
	}

	// Check timestamp tolerance (5 minutes)
	const timestampAge = Math.abs(Date.now() / 1000 - Number(timestamp));
	if (timestampAge > 300) {
		return false;
	}

	// Compute expected signature: HMAC-SHA256 of "timestamp.payload"
	const signedPayload = `${timestamp}.${payload}`;
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(webhookSecret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signatureBytes = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(signedPayload),
	);
	const expectedSignature = Array.from(new Uint8Array(signatureBytes))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	// Constant-time comparison
	return signatures.some((sig) => {
		if (sig.length !== expectedSignature.length) return false;
		let result = 0;
		for (let i = 0; i < sig.length; i++) {
			result |= sig.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
		}
		return result === 0;
	});
}
