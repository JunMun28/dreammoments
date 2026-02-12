import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/auth";
import { friendlyError } from "../../lib/auth-errors";
import { readRedirectFromSearch } from "../../lib/auth-redirect";

export const Route = createFileRoute("/auth/login")({
	component: LoginScreen,
});

function LoginScreen() {
	const { user, signInWithGoogle, signInWithEmail } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [googleTimedOut, setGoogleTimedOut] = useState(false);
	const googleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [success, setSuccess] = useState(false);
	const [redirectTarget] = useState(() =>
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search),
	);

	const canSubmit = email.trim().length > 0 && password.length > 0;

	// Reset Google loading state after 10 seconds if redirect didn't happen
	useEffect(() => {
		if (googleLoading) {
			googleTimerRef.current = setTimeout(() => {
				setGoogleLoading(false);
				setGoogleTimedOut(true);
			}, 10_000);
		} else {
			if (googleTimerRef.current) {
				clearTimeout(googleTimerRef.current);
				googleTimerRef.current = null;
			}
		}
		return () => {
			if (googleTimerRef.current) {
				clearTimeout(googleTimerRef.current);
			}
		};
	}, [googleLoading]);

	if (user || success) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[color:var(--dm-bg)]">
				<div className="flex flex-col items-center gap-4">
					<svg
						className="h-8 w-8 animate-spin text-[color:var(--dm-accent-strong)]"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
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
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					<p className="text-sm text-[color:var(--dm-muted)]">
						Success! Redirecting...
					</p>
				</div>
				<Navigate to={redirectTarget} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16 text-[color:var(--dm-ink)]">
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
						Sign In
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Welcome Back
					</h1>
					<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
						Access your invitations and RSVPs.
					</p>
				</div>

				<button
					type="button"
					disabled={googleLoading}
					className="w-full rounded-full border border-[color:var(--dm-border)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] disabled:opacity-50"
					onClick={() => {
						setGoogleLoading(true);
						setGoogleTimedOut(false);
						void signInWithGoogle(redirectTarget).catch(() => {
							setGoogleLoading(false);
						});
					}}
				>
					{googleLoading ? (
						<span className="inline-flex items-center gap-2">
							<svg
								className="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
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
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
							Redirecting...
						</span>
					) : googleTimedOut ? (
						"Try Again with Google"
					) : (
						"Sign In with Google"
					)}
				</button>

				<div className="rounded-3xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6">
					<form
						className="space-y-4"
						onSubmit={async (event) => {
							event.preventDefault();
							setSubmitting(true);
							setError("");
							try {
								const message = await signInWithEmail({ email, password });
								if (message) {
									setError(friendlyError(message));
								} else {
									setSuccess(true);
								}
							} catch {
								setError("Something went wrong. Please try again.");
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
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
							Password
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									autoComplete="current-password"
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
						</label>
						{error ? (
							<output
								className="text-xs text-dm-error"
								role="alert"
								aria-live="polite"
							>
								{error}
							</output>
						) : null}
						<button
							type="submit"
							disabled={submitting || !canSubmit}
							className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						>
							{submitting ? "Signing In..." : "Sign In"}
						</button>
					</form>
				</div>

				<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					<Link
						to="/auth/reset"
						search={{ redirect: redirectTarget }}
						className="rounded-full px-3 py-2 hover:text-[color:var(--dm-ink)]"
					>
						Forgot Password
					</Link>
					<Link
						to="/auth/signup"
						search={{ redirect: redirectTarget }}
						className="rounded-full px-3 py-2 hover:text-[color:var(--dm-ink)]"
					>
						Create Account
					</Link>
				</div>
			</div>
		</div>
	);
}
