import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { readRedirectFromSearch } from "../../lib/auth-redirect";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/auth/reset")({
	component: ResetScreen,
});

function ResetScreen() {
	const { resetPassword } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const redirectTarget =
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search);

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
			<div className="mx-auto max-w-md space-y-6">
				<div>
					<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
						Reset
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Reset Password
					</h1>
					<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
						Create a new password for your account.
					</p>
				</div>
				<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
					<form
						className="space-y-4"
						onSubmit={async (event) => {
							event.preventDefault();
							setSubmitting(true);
							setMessage("");
							try {
								const error = await resetPassword({ email, password });
								setMessage(
									error ?? "Password updated. Please sign in again.",
								);
							} catch {
								setMessage("Something went wrong. Please try again.");
							} finally {
								setSubmitting(false);
							}
						}}
					>
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							Email
							<input
								type="email"
								name="email"
								autoComplete="email"
								spellCheck={false}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)]"
								required
							/>
						</label>
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							New Password
							<input
								type="password"
								name="password"
								autoComplete="new-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)]"
								required
							/>
						</label>
						{message ? (
							<output
								className="text-xs text-[color:var(--dm-muted)]"
								aria-live="polite"
							>
								{message}
							</output>
						) : null}
						<button
							type="submit"
							disabled={submitting}
							className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						>
							{submitting ? "Updating..." : "Update Password"}
						</button>
					</form>
				</div>
				<Link
					to="/auth/login"
					search={{ redirect: redirectTarget }}
					className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
				>
					Back to Sign In
				</Link>
			</div>
		</div>
	);
}
