import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createCheckoutSessionFn } from "../../api/payments";
import { RouteErrorFallback } from "../../components/ui/RouteErrorFallback";
import { RouteLoadingSpinner } from "../../components/ui/RouteLoadingSpinner";
import { useAuth } from "../../lib/auth";
import { PRICING } from "../../lib/stripe";

export const Route = createFileRoute("/upgrade/")({
	component: UpgradeScreen,
	pendingComponent: RouteLoadingSpinner,
	errorComponent: RouteErrorFallback,
});

const PAYMENT_ICONS: Record<string, string> = {
	Card: "M3 10h18M7 15h.01M11 15h2M21 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5z",
	FPX: "M3 6h18v12H3zM3 10h18M7 14h4",
	GrabPay:
		"M17 9V7a5 5 0 00-10 0v2M12 14v2M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z",
	PayNow: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};

function UpgradeScreen() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [currency, setCurrency] = useState<"MYR" | "SGD">("MYR");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	if (!user) return <Navigate to="/auth/login" />;
	if (user.plan === "premium") return <Navigate to="/dashboard" />;

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

				<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] p-6">
					<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
						Free plan includes
					</p>
					<ul className="mt-3 space-y-2 text-sm text-[color:var(--dm-muted)]">
						<li className="flex items-center gap-2">
							<span className="text-[color:var(--dm-muted)]" aria-hidden="true">
								&#10003;
							</span>
							1 invitation
						</li>
						<li className="flex items-center gap-2">
							<span className="text-[color:var(--dm-muted)]" aria-hidden="true">
								&#10003;
							</span>
							5 AI generations
						</li>
						<li className="flex items-center gap-2">
							<span className="text-[color:var(--dm-muted)]" aria-hidden="true">
								&#10003;
							</span>
							Basic sharing
						</li>
					</ul>
				</div>

				<div className="rounded-3xl border border-[color:var(--dm-accent-strong)] bg-[color:var(--dm-surface)] p-6">
					<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]">
						Premium includes everything in Free, plus
					</p>
					<ul className="mt-3 space-y-3 text-sm text-[color:var(--dm-ink)]">
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							<div>
								<span className="font-medium">Custom URL slug</span>
								<p className="text-xs text-[color:var(--dm-muted)]">
									Share a personalized link like dreammoments.app/jun-mei
								</p>
							</div>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							<div>
								<span className="font-medium">100 AI generations</span>
								<p className="text-xs text-[color:var(--dm-muted)]">
									Let AI craft beautiful wording for every section
								</p>
							</div>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							<div>
								<span className="font-medium">CSV import + export</span>
								<p className="text-xs text-[color:var(--dm-muted)]">
									Bulk manage your guest list from spreadsheets
								</p>
							</div>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							<div>
								<span className="font-medium">Advanced analytics</span>
								<p className="text-xs text-[color:var(--dm-muted)]">
									Track views, RSVPs, and guest engagement in real time
								</p>
							</div>
						</li>
					</ul>

					<div className="mt-6">
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							Currency
							<select
								value={currency}
								onChange={(event) =>
									setCurrency(event.target.value as "MYR" | "SGD")
								}
								className="h-12 appearance-none rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 pr-10 text-base text-[color:var(--dm-ink)]"
								style={{
									backgroundImage:
										"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B5C4E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
									backgroundRepeat: "no-repeat",
									backgroundPosition: "right 1rem center",
									backgroundSize: "1rem",
								}}
								name="currency"
								autoComplete="off"
							>
								<option value="MYR">MYR (RM49)</option>
								<option value="SGD">SGD ($19)</option>
							</select>
						</label>
					</div>

					<div className="mt-4 flex flex-wrap items-center gap-3">
						{methods.map((method) => (
							<span
								key={method}
								className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--dm-border)] px-3 py-1.5 text-xs text-[color:var(--dm-muted)]"
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d={PAYMENT_ICONS[method] ?? PAYMENT_ICONS.Card} />
								</svg>
								{method}
							</span>
						))}
					</div>

					<p className="mt-4 text-2xl font-semibold text-[color:var(--dm-ink)]">
						{price.label}
					</p>

					<button
						type="button"
						disabled={loading}
						className="mt-4 w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						onClick={() => void handleCheckout()}
					>
						{loading ? (
							<span className="inline-flex items-center gap-2">
								<svg
									className="h-4 w-4 animate-spin"
									viewBox="0 0 24 24"
									fill="none"
									aria-hidden="true"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Redirecting...
							</span>
						) : (
							"Proceed to Checkout"
						)}
					</button>

					<div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[color:var(--dm-muted)]">
						<svg
							className="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0110 0v4" />
						</svg>
						Secure checkout powered by Stripe
					</div>

					{error ? (
						<output
							className="mt-3 block text-xs text-red-600"
							aria-live="polite"
						>
							{error}
						</output>
					) : null}
				</div>

				<p className="text-center text-xs text-[color:var(--dm-muted)]">
					Trusted by 2,000+ couples across Malaysia and Singapore
				</p>
			</div>
		</div>
	);
}
