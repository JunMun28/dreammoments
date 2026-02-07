import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { readRedirectFromSearch } from "../../lib/auth-redirect";
import { useAuth } from "../../lib/auth";

export const Route = createFileRoute("/auth/signup")({
	component: SignupScreen,
});

function SignupScreen() {
	const { user, signUpWithEmail, signInWithGoogle } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const redirectTarget =
		typeof window === "undefined"
			? "/dashboard"
			: readRedirectFromSearch(window.location.search);

	if (user) return <Navigate to={redirectTarget} />;

	return (
		<div className="min-h-screen bg-[color:var(--dm-bg)] px-6 py-16">
			<div className="mx-auto max-w-md space-y-6">
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
					className="w-full rounded-full border border-[color:var(--dm-border)] px-4 py-3 text-sm uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
					onClick={() => signInWithGoogle(redirectTarget)}
				>
					Continue with Google
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
								setError(message ?? "");
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
								className="h-12 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 text-base text-[color:var(--dm-ink)]"
								required
							/>
						</label>
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
							Password (8+)
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
						{error ? (
							<output className="text-xs text-[#b91c1c]" aria-live="polite">
								{error}
							</output>
						) : null}
						<button
							type="submit"
							disabled={submitting}
							className="w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						>
							{submitting ? "Creating Account..." : "Create Account"}
						</button>
					</form>
				</div>

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
