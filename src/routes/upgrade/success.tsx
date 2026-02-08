import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPaymentStatusFn } from "../../api/payments";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/upgrade/success")({
	component: UpgradeSuccessScreen,
});

function UpgradeSuccessScreen() {
	const { user } = useAuth();
	const [verified, setVerified] = useState(false);
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		const checkStatus = async () => {
			const token = window.localStorage.getItem("dm-auth-token");
			if (!token) {
				setChecking(false);
				return;
			}

			try {
				const result = await getPaymentStatusFn({
					data: { token },
				});

				if ("isPremium" in result && result.isPremium) {
					setVerified(true);
				}
			} catch {
				// Non-critical: user can still see success page
			} finally {
				setChecking(false);
			}
		};

		void checkStatus();
	}, []);

	if (!user) return <Navigate to="/auth/login" />;

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
			<div className="mx-auto max-w-xl text-center">
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--dm-sage)]/20 text-4xl">
					&#127881;
				</div>

				<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
					Thank You
				</p>

				<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
					Premium Unlocked
				</h1>

				<p className="mt-4 text-sm text-[color:var(--dm-muted)]">
					{checking
						? "Verifying your payment..."
						: verified
							? "Your premium upgrade has been confirmed. You now have access to all premium features."
							: "Your payment is being processed. Premium features will be available shortly."}
				</p>

				<ul className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm text-[color:var(--dm-muted)]">
					<li>Custom URL slug for your invitations</li>
					<li>100 AI generations per invitation</li>
					<li>CSV import and export</li>
					<li>Advanced analytics dashboard</li>
				</ul>

				<div className="mt-8 flex justify-center gap-4">
					<Link
						to="/dashboard"
						className="rounded-full border border-[color:var(--dm-border)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		</div>
	);
}
