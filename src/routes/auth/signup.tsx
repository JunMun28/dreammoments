import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../lib/auth";
import { friendlyError } from "../../lib/auth-errors";
import { readRedirectFromSearch } from "../../lib/auth-redirect";

export const Route = createFileRoute("/auth/signup")({
	component: SignupScreen,
});

function getPasswordChecks(password: string) {
	return {
		hasLength: password.length >= 8,
		hasUppercase: /[A-Z]/.test(password),
		hasNumber: /[0-9]/.test(password),
		hasSpecial: /[^A-Za-z0-9]/.test(password),
	};
}

function getStrengthStyle(score: number): { bar: string; text: string; label: string } {
	if (score <= 1)
		return { bar: "bg-dm-error", text: "text-dm-error", label: "Weak" };
	if (score <= 2)
		return { bar: "bg-dm-warning", text: "text-dm-warning", label: "Medium" };
	return { bar: "bg-dm-success", text: "text-dm-success", label: "Strong" };
}

export function PasswordStrengthBar({ password }: { password: string }) {
	const checks = useMemo(() => getPasswordChecks(password), [password]);
	const score = Object.values(checks).filter(Boolean).length;
	const strength = getStrengthStyle(score);

	return (
		<div className="mt-1 space-y-1.5">
			<div className="flex gap-1">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className={`h-1 flex-1 rounded-full transition-colors ${
							i <= score ? strength.bar : "bg-[color:var(--dm-border)]"
						}`}
					/>
				))}
			</div>
			<p className={`text-xs ${strength.text}`}>
				{strength.label}
				{!checks.hasLength &&
					` \u2014 ${8 - password.length} more characters needed`}
			</p>
			<ul className="space-y-0.5 text-[10px] text-[color:var(--dm-muted)]">
				<li>{checks.hasLength ? "\u2713" : "\u2717"} At least 8 characters</li>
				<li>
					{checks.hasUppercase ? "\u2713" : "\u2717"} Uppercase letter
				</li>
				<li>{checks.hasNumber ? "\u2713" : "\u2717"} Number</li>
				<li>
					{checks.hasSpecial ? "\u2713" : "\u2717"} Special character
				</li>
			</ul>
		</div>
	);
}

function SignupScreen() {
	const { user, signUpWithEmail, signInWithGoogle } = useAuth();
	const [name, setName] = useState("");
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

	const canSubmit =
		name.trim().length > 0 && email.trim().length > 0 && password.length >= 8;

	const isEmailExistsError =
		error.includes("already exists") || error.includes("Try signing in");

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
						Sign Up
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-[color:var(--dm-ink)]">
						Create Your Account
					</h1>
					<p className="mt-2 text-sm text-[color:var(--dm-muted)]">
						Start your invitation in minutes.
					</p>
				</div>

				<button
					type="button"
					disabled={googleLoading}
					className="w-full rounded-full border border-[color:var(--dm-border)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] disabled:opacity-50"
					onClick={() => {
						setGoogleLoading(true);
						setGoogleTimedOut(false);
						try {
							signInWithGoogle(redirectTarget);
						} catch {
							setGoogleLoading(false);
						}
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
						"Continue with Google"
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
								const message = await signUpWithEmail({
									email,
									password,
									name,
								});
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
							Name
							<input
								name="name"
								autoComplete="name"
								value={name}
								onChange={(event) => setName(event.target.value)}
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 focus-visible:outline-none"
								required
							/>
						</label>
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
							Password (8+)
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									autoComplete="new-password"
									minLength={8}
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="h-12 w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 pr-11 text-base text-[color:var(--dm-ink)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 focus-visible:outline-none"
									required
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
						{error ? (
							<div>
								<output
									className="text-xs text-dm-error"
									role="alert"
									aria-live="polite"
								>
									{error}
								</output>
								{isEmailExistsError && (
									<Link
										to="/auth/login"
										search={{ redirect: redirectTarget }}
										className="mt-1 block text-xs font-medium text-[color:var(--dm-accent-strong)] underline"
									>
										Sign in instead
									</Link>
								)}
							</div>
						) : null}
						<button
							type="submit"
							disabled={submitting || !canSubmit}
							className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						>
							{submitting ? "Creating Account..." : "Create Account"}
						</button>
					</form>
				</div>

				<p className="mt-4 text-center text-xs text-[color:var(--dm-muted)]">
					By creating an account, you agree to our{" "}
					<Link
						to="/terms"
						className="underline hover:text-[color:var(--dm-ink)]"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						to="/privacy"
						className="underline hover:text-[color:var(--dm-ink)]"
					>
						Privacy Policy
					</Link>
					.
				</p>

				<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
					<Link
						to="/auth/login"
						search={{ redirect: redirectTarget }}
						className="rounded-full px-3 py-2 hover:text-[color:var(--dm-ink)]"
					>
						Already Have an Account
					</Link>
				</div>
			</div>
		</div>
	);
}
