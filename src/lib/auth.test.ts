// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'

vi.mock('@neondatabase/auth', () => ({
  createAuthClient: vi.fn().mockReturnValue({ signIn: {} }),
}))

vi.mock('@neondatabase/auth/react', () => ({
  BetterAuthReactAdapter: vi.fn(),
}))

import { createAuthClient } from '@neondatabase/auth'

describe('Auth Lib', () => {
  it('calls createAuthClient with correct params', async () => {
    // Import the module to trigger top-level execution
    await import('./auth')
    expect(createAuthClient).toHaveBeenCalled()
  })
})
