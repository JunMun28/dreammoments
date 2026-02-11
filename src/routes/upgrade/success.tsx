import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPaymentStatusFn } from "../../api/payments";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/upgrade/success")({
	component: UpgradeSuccessScreen,
});

const VERIFICATION_TIMEOUT_MS = 15_000;

function UpgradeSuccessScreen() {
	const { user, refreshUser } = useAuth();
	const [verified, setVerified] = useState(false);
	const [checking, setChecking] = useState(true);
	const [timedOut, setTimedOut] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const checkManually = useCallback(async () => {
		setChecking(true);
		setTimedOut(false);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(() => {
			setTimedOut(true);
			setChecking(false);
		}, VERIFICATION_TIMEOUT_MS);

		try {
			const token = window.localStorage.getItem("dm-auth-token");
			if (!token) {
				setChecking(false);
				return;
			}

			const result = await getPaymentStatusFn({
				data: { token },
			});

			if ("isPremium" in result && result.isPremium) {
				setVerified(true);
				if (timeoutRef.current) clearTimeout(timeoutRef.current);
				await refreshUser();
			}
		} catch {
			// Non-critical: user can still see success page
		} finally {
			setChecking(false);
		}
	}, [refreshUser]);

	useEffect(() => {
		void checkManually();

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [checkManually]);

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

				{checking && !timedOut && (
					<div className="mt-4 flex items-center justify-center gap-2 text-sm text-[color:var(--dm-muted)]">
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
						Verifying your payment...
					</div>
				)}

				{timedOut && !verified && (
					<div className="mt-4 space-y-3">
						<p className="text-sm text-[color:var(--dm-muted)]">
							Verification is taking longer than expected. Your payment was
							received -- premium features will activate shortly.
						</p>
						<button
							type="button"
							className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
							onClick={() => void checkManually()}
						>
							Check Again
						</button>
					</div>
				)}

				{!checking && !timedOut && (
					<p className="mt-4 text-sm text-[color:var(--dm-muted)]">
						{verified
							? "Your premium upgrade has been confirmed. You now have access to all premium features."
							: "Your payment is being processed. Premium features will be available shortly."}
					</p>
				)}

				<div className="mx-auto mt-8 max-w-xs text-left">
					<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
						Here's what you can do now
					</p>
					<ul className="mt-3 space-y-2 text-sm text-[color:var(--dm-muted)]">
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							Set a custom URL slug for your invitation
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							Use AI to generate beautiful wording
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							Import your guest list via CSV
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-0.5 text-dm-success" aria-hidden="true">
								&#10003;
							</span>
							View real-time analytics for your invitations
						</li>
					</ul>
				</div>

				<div className="mt-8 flex flex-wrap justify-center gap-4">
					<Link
						to="/editor/new"
						className="rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					>
						Create New Invitation
					</Link>
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
