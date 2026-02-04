import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../lib/auth'

export const Route = createFileRoute('/auth/login')({
	component: LoginScreen,
})

function LoginScreen() {
	const { user, signInWithGoogle, signInWithEmail } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')

	if (user) return <Navigate to="/dashboard" />

	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-16">
			<div className="mx-auto max-w-md space-y-6">
				<div>
				<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">Sign In</p>
				<h1 className="mt-3 text-3xl font-semibold text-[#fdf6ea]">Welcome Back</h1>
					<p className="mt-2 text-sm text-[#f7e8c4]/70">Access your invitations and RSVPs.</p>
				</div>

			<button
				type="button"
				className="w-full rounded-full border border-white/15 px-4 py-3 text-sm uppercase tracking-[0.2em] text-[#f7e8c4]"
				onClick={signInWithGoogle}
			>
				Sign In with Google
			</button>

				<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
					<form
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault()
							const message = signInWithEmail({ email, password })
							setError(message ?? '')
						}}
					>
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
							Email
							<input
								type="email"
								name="email"
								autoComplete="email"
								spellCheck={false}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="h-12 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[#f7e8c4]"
								required
							/>
						</label>
						<label className="grid gap-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
							Password
							<input
								type="password"
								name="password"
								autoComplete="current-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="h-12 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[#f7e8c4]"
								required
							/>
						</label>
						{error ? (
							<p role="status" className="text-xs text-[#f59e0b]">
								{error}
							</p>
						) : null}
						<button
							type="submit"
							className="w-full rounded-full bg-[#d8b25a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
						>
							Sign In
						</button>
					</form>
				</div>

				<div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
					<Link to="/auth/reset" className="rounded-full px-3 py-2 hover:text-white">Forgot Password</Link>
					<Link to="/auth/signup" className="rounded-full px-3 py-2 hover:text-white">Create Account</Link>
				</div>
			</div>
		</div>
	)
}
