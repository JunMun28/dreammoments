import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { recordPayment, updateUserPlan } from "../lib/data";

export const Route = createFileRoute("/upgrade")({
	component: UpgradeScreen,
});

function UpgradeScreen() {
	const { user } = useAuth();
	const [currency, setCurrency] = useState<"MYR" | "SGD">("MYR");
	const [status, setStatus] = useState("");

	if (!user) return <Navigate to="/auth/login" />;

	const amount = currency === "MYR" ? 4900 : 1900;
	const methods =
		currency === "MYR"
			? ["Card", "FPX", "GrabPay"]
			: ["Card", "PayNow", "GrabPay"];

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
						Mock Stripe Checkout for testing.
					</p>
				</div>
				<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
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
							<option value="MYR">MYR</option>
							<option value="SGD">SGD</option>
						</select>
					</label>
					<p className="mt-4 text-sm text-[color:var(--dm-muted)]">
						Available Methods: {methods.join(", ")}
					</p>
					<button
						type="button"
						className="mt-4 w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
						onClick={() => {
							recordPayment({
								userId: user.id,
								amountCents: amount,
								currency,
								status: "succeeded",
							});
							updateUserPlan(user.id, "premium");
							setStatus("Payment succeeded. Premium unlocked.");
						}}
					>
						Proceed to Stripe Checkout
					</button>
					{status ? (
						<output
							className="mt-3 text-xs text-[color:var(--dm-muted)]"
							aria-live="polite"
						>
							{status}
						</output>
					) : null}
				</div>
			</div>
		</div>
	);
}
