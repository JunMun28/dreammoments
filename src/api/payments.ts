import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, isProduction, schema } from "@/db/index";
import { recordPayment, updateUserPlan } from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";
import {
	createCheckoutSession,
	getStripeConfig,
	PRICING,
	verifyWebhookSignature,
} from "@/lib/stripe";
import { parseInput } from "./validate";

// ── Create Checkout Session ─────────────────────────────────────────

const createCheckoutSchema = z.object({
	token: z.string().min(1, "Token is required"),
	currency: z.enum(["MYR", "SGD"]),
	invitationId: z.string().optional(),
});

export const createCheckoutSessionFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { token: string; currency: "MYR" | "SGD"; invitationId?: string }) =>
			parseInput(createCheckoutSchema, data),
	)
	.handler(async ({ data }): Promise<{ url: string } | { error: string }> => {
		const { userId } = await requireAuth(data.token);

		const stripeConfig = getStripeConfig();

		// Graceful fallback: if Stripe is not configured, use mock in dev
		if (!stripeConfig) {
			if (isProduction()) {
				return { error: "Payment processing is not configured." };
			}

			console.warn(
				"[Payments] STRIPE_SECRET_KEY not set. Using mock checkout in development.",
			);

			// In dev without Stripe, directly upgrade the user
			const db = getDbOrNull();
			const price = PRICING[data.currency];

			if (db) {
				await db
					.update(schema.users)
					.set({ plan: "premium", updatedAt: new Date() })
					.where(eq(schema.users.id, userId));

				await db.insert(schema.payments).values({
					userId,
					invitationId: data.invitationId || null,
					amountCents: price.amountCents,
					currency: data.currency,
					status: "succeeded",
					stripePaymentIntentId: `mock_${Date.now()}`,
				});
			} else {
				updateUserPlan(userId, "premium");
				recordPayment({
					userId,
					invitationId: data.invitationId,
					amountCents: price.amountCents,
					currency: data.currency,
					status: "succeeded",
				});
			}

			return { url: "/upgrade/success?mock=true" };
		}

		// Look up user email for Stripe customer_email
		let email = "";
		const db = getDbOrNull();

		if (db) {
			const [user] = await db
				.select({ email: schema.users.email })
				.from(schema.users)
				.where(eq(schema.users.id, userId));
			email = user?.email ?? "";
		}

		if (!email) {
			return { error: "Could not determine user email." };
		}

		// Build absolute URLs for Stripe redirect
		const baseUrl =
			process.env.VITE_PUBLIC_URL ||
			process.env.PUBLIC_URL ||
			"http://localhost:3000";
		const successUrl = `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = `${baseUrl}/upgrade?cancelled=true`;

		try {
			const session = await createCheckoutSession(stripeConfig, {
				userId,
				email,
				currency: data.currency,
				invitationId: data.invitationId,
				successUrl,
				cancelUrl,
			});

			if (!session.url) {
				return { error: "Stripe did not return a checkout URL." };
			}

			return { url: session.url };
		} catch (err) {
			console.error("[Payments] Failed to create checkout session:", err);
			return {
				error: "Failed to initialize payment. Please try again.",
			};
		}
	});

// ── Stripe Webhook ──────────────────────────────────────────────────

const webhookSchema = z.object({
	payload: z.string().min(1),
	signature: z.string().min(1),
});

export const handleStripeWebhookFn = createServerFn({ method: "POST" })
	.inputValidator((data: { payload: string; signature: string }) =>
		parseInput(webhookSchema, data),
	)
	.handler(
		async ({ data }): Promise<{ received: boolean } | { error: string }> => {
			const stripeConfig = getStripeConfig();
			if (!stripeConfig) {
				return { error: "Stripe is not configured." };
			}

			// Verify webhook signature
			const isValid = await verifyWebhookSignature(
				data.payload,
				data.signature,
				stripeConfig.webhookSecret,
			);

			if (!isValid) {
				return { error: "Invalid webhook signature." };
			}

			let event: {
				id: string;
				type: string;
				data: {
					object: {
						id: string;
						metadata?: Record<string, string>;
						payment_intent?: string;
						customer?: string;
						amount_total?: number;
						currency?: string;
					};
				};
			};

			try {
				event = JSON.parse(data.payload);
			} catch {
				return { error: "Invalid payload" };
			}

			if (event.type === "checkout.session.completed") {
				const session = event.data.object;
				const userId = session.metadata?.user_id;
				const currency = (session.metadata?.currency ?? "MYR").toUpperCase() as
					| "MYR"
					| "SGD";
				const invitationId = session.metadata?.invitation_id;

				if (!userId) {
					console.error(
						"[Webhook] checkout.session.completed missing user_id metadata",
					);
					return { error: "Missing user_id in session metadata." };
				}

				const db = getDbOrNull();
				const paymentIntentId = session.payment_intent ?? session.id;

				if (db) {
					// Idempotency: skip if this payment was already processed
					const [existing] = await db
						.select({ id: schema.payments.id })
						.from(schema.payments)
						.where(eq(schema.payments.stripePaymentIntentId, paymentIntentId));

					if (existing) {
						return { received: true };
					}

					// Upgrade user to premium
					await db
						.update(schema.users)
						.set({ plan: "premium", updatedAt: new Date() })
						.where(eq(schema.users.id, userId));

					// Record payment
					await db.insert(schema.payments).values({
						userId,
						invitationId: invitationId || null,
						stripePaymentIntentId: paymentIntentId,
						stripeCustomerId: session.customer ?? null,
						amountCents:
							session.amount_total ??
							PRICING[currency as "MYR" | "SGD"]?.amountCents ??
							0,
						currency,
						status: "succeeded",
					});
				} else {
					// Dev fallback
					updateUserPlan(userId, "premium");
					recordPayment({
						userId,
						invitationId,
						amountCents: session.amount_total ?? 0,
						currency,
						status: "succeeded",
					});
				}
			}

			return { received: true };
		},
	);

// ── Payment Status ──────────────────────────────────────────────────

const paymentStatusSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const getPaymentStatusFn = createServerFn({ method: "GET" })
	.inputValidator((data: { token: string }) =>
		parseInput(paymentStatusSchema, data),
	)
	.handler(
		async ({
			data,
		}): Promise<{ plan: string; isPremium: boolean } | { error: string }> => {
			const { userId } = await requireAuth(data.token);

			const db = getDbOrNull();

			if (db) {
				const [user] = await db
					.select({ plan: schema.users.plan })
					.from(schema.users)
					.where(eq(schema.users.id, userId));

				if (!user) {
					return { error: "User not found." };
				}

				const plan = user.plan ?? "free";
				return { plan, isPremium: plan === "premium" };
			}

			// Dev fallback: always return free unless upgraded via mock
			return { plan: "free", isPremium: false };
		},
	);
