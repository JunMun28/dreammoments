import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../lib/auth'

export const Route = createFileRoute('/auth/reset')({
	component: ResetScreen,
})

function ResetScreen() {
	const { resetPassword } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')

	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-16">
			<div className="mx-auto max-w-md space-y-6">
				<div>
				<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">Reset</p>
				<h1 className="mt-3 text-3xl font-semibold text-[#fdf6ea]">Reset Password</h1>
					<p className="mt-2 text-sm text-[#f7e8c4]/70">Create a new password for your account.</p>
				</div>
				<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
					<form
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault()
							const error = resetPassword({ email, password })
							setMessage(error ?? 'Password updated. Please sign in again.')
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
							New Password
							<input
								type="password"
								name="password"
								autoComplete="new-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="h-12 rounded-2xl border border-white/10 bg-[#0f0c0a] px-4 text-base text-[#f7e8c4]"
								required
							/>
						</label>
						{message ? (
							<p role="status" className="text-xs text-[#f7e8c4]/70">
								{message}
							</p>
						) : null}
						<button
							type="submit"
							className="w-full rounded-full bg-[#d8b25a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
						>
							Update Password
						</button>
					</form>
				</div>
			<Link to="/auth/login" className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/70">
				Back to Sign In
			</Link>
			</div>
		</div>
	)
}
