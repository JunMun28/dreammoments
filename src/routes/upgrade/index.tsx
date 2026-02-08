import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createCheckoutSessionFn } from "../../api/payments";
import { useAuth } from "../../lib/auth";
import { PRICING } from "../../lib/stripe";

export const Route = createFileRoute("/upgrade/")({
	component: UpgradeScreen,
});

function UpgradeScreen() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [currency, setCurrency] = useState<"MYR" | "SGD">("MYR");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	if (!user) return <Navigate to="/auth/login" />;

	const price = PRICING[currency];
	const methods =
		currency === "MYR"
			? ["Card", "FPX", "GrabPay"]
			: ["Card", "PayNow", "GrabPay"];

	const handleCheckout = async () => {
		setLoading(true);
		setError("");

		try {
			const token = window.localStorage.getItem("dm-auth-token");
			if (!token) {
				setError("Please log in to continue.");
				setLoading(false);
				return;
			}

			const result = await createCheckoutSessionFn({
				data: { token, currency },
			});

			if ("error" in result) {
				setError(result.error);
				setLoading(false);
				return;
			}

			// Redirect to Stripe Checkout (external URL) or internal success page (mock)
			if (result.url.startsWith("http")) {
				window.location.href = result.url;
			} else {
				navigate({ to: result.url });
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
			<div className="mx-auto max-w-xl space-y-6">
				<div>
					<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
						Upgrade
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Premium Checkout
					</h1>
					<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
						Unlock premium features for your wedding invitations.
					</p>
				</div>

				<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
					<ul className="space-y-2 text-sm text-[color:var(--dm-muted)]">
						<li>Custom URL slug</li>
						<li>100 AI generations</li>
						<li>CSV import + export</li>
						<li>Advanced analytics</li>
					</ul>

					<div className="mt-6">
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							Currency
							<select
								value={currency}
								onChange={(event) =>
									setCurrency(event.target.value as "MYR" | "SGD")
								}
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)]"
								name="currency"
								autoComplete="off"
							>
								<option value="MYR">MYR (RM49)</option>
								<option value="SGD">SGD ($19)</option>
							</select>
						</label>
					</div>

					<p className="mt-4 text-sm text-[color:var(--dm-muted)]">
						Available Methods: {methods.join(", ")}
					</p>

					<p className="mt-2 text-2xl font-semibold text-[color:var(--dm-ink)]">
						{price.label}
					</p>

					<button
						type="button"
						disabled={loading}
						className="mt-4 w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						onClick={() => void handleCheckout()}
					>
						{loading ? "Redirecting..." : "Proceed to Checkout"}
					</button>

					{error ? (
						<output
							className="mt-3 block text-xs text-red-600"
							aria-live="polite"
						>
							{error}
						</output>
					) : null}
				</div>
			</div>
		</div>
	);
}
