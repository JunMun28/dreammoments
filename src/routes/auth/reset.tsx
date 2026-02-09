import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { confirmPasswordResetFn } from "../../api/auth";
import { useAuth } from "../../lib/auth";
import { readRedirectFromSearch } from "../../lib/auth-redirect";

export const Route = createFileRoute("/auth/reset")({
	component: ResetScreen,
	validateSearch: (
		search: Record<string, unknown>,
	): { token?: string; redirect?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
});

function ResetScreen() {
	const { token } = useSearch({ from: "/auth/reset" });

	if (token) {
		return <ConfirmResetForm token={token} />;
	}

	return <RequestResetForm />;
}

function RequestResetForm() {
	const { resetPassword } = useAuth();
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const redirectTarget =
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search);

	if (submitted) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
				<div className="mx-auto max-w-md space-y-6">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Check Your Email
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
							Reset Link Sent
						</h1>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
							If an account exists for that email, we've sent a password reset
							link. Please check your inbox and spam folder.
						</p>
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
						Enter your email and we'll send you a link to reset your password.
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
								const error = await resetPassword({ email });
								if (error) {
									setMessage(error);
								} else {
									setSubmitted(true);
								}
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
							{submitting ? "Sending..." : "Send Reset Link"}
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

function ConfirmResetForm({ token }: { token: string }) {
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const redirectTarget =
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search);

	if (success) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
				<div className="mx-auto max-w-md space-y-6">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
							Success
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
							Password Updated
						</h1>
						<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
							Your password has been reset. You can now sign in with your new
							password.
						</p>
					</div>
					<Link
						to="/auth/login"
						search={{ redirect: redirectTarget }}
						className="inline-block rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					>
						Sign In
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
			<div className="mx-auto max-w-md space-y-6">
				<div>
					<p className="text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
						Reset
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Choose New Password
					</h1>
					<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
						Enter your new password below.
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
								const result = await confirmPasswordResetFn({
									data: { token, password },
								});
								if ("error" in result) {
									setMessage(result.error);
								} else {
									setSuccess(true);
								}
							} catch {
								setMessage("Something went wrong. Please try again.");
							} finally {
								setSubmitting(false);
							}
						}}
					>
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
								minLength={8}
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
