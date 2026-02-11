import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { confirmPasswordResetFn } from "../../api/auth";
import { useAuth } from "../../lib/auth";
import { friendlyError } from "../../lib/auth-errors";
import { readRedirectFromSearch } from "../../lib/auth-redirect";
import { PasswordStrengthBar } from "./signup";

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
	const [redirectTarget] = useState(() =>
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search),
	);

	if (submitted) {
		return (
			<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
				<div className="mx-auto max-w-md space-y-6">
					<Link
						to="/"
						className="mb-8 inline-flex items-center gap-2 text-sm text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)] transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M19 12H5" />
							<path d="M12 19l-7-7 7-7" />
						</svg>
						Back to Home
					</Link>

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
						className="inline-block rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
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
				<Link
					to="/"
					className="mb-8 inline-flex items-center gap-2 text-sm text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)] transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M19 12H5" />
						<path d="M12 19l-7-7 7-7" />
					</svg>
					Back to Home
				</Link>

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
									setMessage(friendlyError(error));
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
								inputMode="email"
								autoComplete="email"
								spellCheck={false}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 focus-visible:outline-none"
								required
							/>
						</label>
						{message ? (
							<output
								className="text-xs text-dm-error"
								role="alert"
								aria-live="polite"
							>
								{message}
							</output>
						) : null}
						<button
							type="submit"
							disabled={submitting || email.trim().length === 0}
							className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						>
							{submitting ? "Sending..." : "Send Reset Link"}
						</button>
					</form>
				</div>
				<Link
					to="/auth/login"
					search={{ redirect: redirectTarget }}
					className="inline-block rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
				>
					Back to Sign In
				</Link>
			</div>
		</div>
	);
}

function ConfirmResetForm({ token }: { token: string }) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [redirectTarget] = useState(() =>
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search),
	);

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
				<Link
					to="/"
					className="mb-8 inline-flex items-center gap-2 text-sm text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)] transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M19 12H5" />
						<path d="M12 19l-7-7 7-7" />
					</svg>
					Back to Home
				</Link>

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
							if (password !== confirmPassword) {
								setMessage("Passwords do not match.");
								return;
							}
							setSubmitting(true);
							setMessage("");
							try {
								const result = await confirmPasswordResetFn({
									data: { token, password },
								});
								if ("error" in result) {
									setMessage(friendlyError(result.error));
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
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									autoComplete="new-password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="h-12 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 pr-11 text-base text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 focus-visible:outline-none"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)]"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
								</button>
							</div>
							{password.length > 0 && (
								<PasswordStrengthBar password={password} />
							)}
						</label>
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							Confirm Password
							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									name="confirmPassword"
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									className="h-12 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 pr-11 text-base text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 focus-visible:outline-none"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--dm-muted)] hover:text-[color:var(--dm-ink)]"
									aria-label={
										showConfirmPassword ? "Hide password" : "Show password"
									}
								>
									{showConfirmPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											aria-hidden="true"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
								</button>
							</div>
						</label>
						{confirmPassword.length > 0 && password !== confirmPassword && (
							<p className="text-xs text-dm-error" role="alert">
								Passwords do not match.
							</p>
						)}
						{message ? (
							<output
								className="text-xs text-dm-error"
								role="alert"
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
					className="inline-block rounded-full bg-[color:var(--dm-accent-strong)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
				>
					Back to Sign In
				</Link>
			</div>
		</div>
	);
}
