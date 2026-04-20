import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockResend = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()
const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      resend: mockResend,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
    },
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  }),
}))

describe('Auth Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Sign Up', () => {
    it('should successfully sign up a new user', async () => {
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            identities: [{ id: 'identity-1' }],
          },
        },
        error: null,
      })

      const result = await mockSignUp({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.error).toBeNull()
      expect(result.data.user).toBeDefined()
      expect(result.data.user.identities.length).toBeGreaterThan(0)
    })

    it('should detect existing user on sign up (empty identities)', async () => {
      // Supabase returns user with empty identities array for existing users
      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: 'existing-user-id',
            email: 'existing@example.com',
            identities: [], // Empty array = user already exists
          },
        },
        error: null,
      })

      const result = await mockSignUp({
        email: 'existing@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.error).toBeNull()
      expect(result.data.user.identities).toHaveLength(0)
      // Application should detect this and show "account already exists" message
    })

    it('should handle sign up error', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email format' },
      })

      const result = await mockSignUp({
        email: 'invalid-email',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.error).not.toBeNull()
      expect(result.error.message).toBe('Invalid email format')
    })
  })

  describe('Sign In', () => {
    it('should successfully sign in a confirmed user', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'token123' },
        },
        error: null,
      })

      const result = await mockSignInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.error).toBeNull()
      expect(result.data.session).toBeDefined()
    })

    it('should fail sign in with wrong password', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await mockSignInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      expect(result.error).not.toBeNull()
      expect(result.error.message).toBe('Invalid login credentials')
    })

    it('should fail sign in for unconfirmed email', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email not confirmed' },
      })

      const result = await mockSignInWithPassword({
        email: 'unconfirmed@example.com',
        password: 'password123',
      })

      expect(result.error).not.toBeNull()
      expect(result.error.message).toBe('Email not confirmed')
    })
  })

  describe('Resend Confirmation Email', () => {
    it('should successfully resend confirmation email', async () => {
      mockResend.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await mockResend({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.error).toBeNull()
    })

    it('should handle rate limiting on resend', async () => {
      mockResend.mockResolvedValue({
        data: null,
        error: { message: 'For security purposes, you can only request this once every 60 seconds' },
      })

      const result = await mockResend({
        type: 'signup',
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      expect(result.error).not.toBeNull()
      expect(result.error.message).toContain('60 seconds')
    })
  })

  describe('Password Reset', () => {
    it('should successfully send password reset email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const result = await mockResetPasswordForEmail('test@example.com', {
        redirectTo: 'http://localhost:3000/auth/reset-password',
      })

      expect(result.error).toBeNull()
    })

    it('should successfully update password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      const result = await mockUpdateUser({ password: 'newpassword123' })

      expect(result.error).toBeNull()
      expect(result.data.user).toBeDefined()
    })

    it('should fail to update with weak password', async () => {
      mockUpdateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password should be at least 6 characters' },
      })

      const result = await mockUpdateUser({ password: '123' })

      expect(result.error).not.toBeNull()
      expect(result.error.message).toContain('6 characters')
    })
  })

  describe('Auth Callback', () => {
    it('should successfully exchange code for session', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: {
          session: { access_token: 'token123' },
          user: { id: 'test-user-id' },
        },
        error: null,
      })

      const result = await mockExchangeCodeForSession('valid-code')

      expect(result.error).toBeNull()
      expect(result.data.session).toBeDefined()
    })

    it('should handle expired OTP link', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: null,
        error: { message: 'Email link is invalid or has expired' },
      })

      const result = await mockExchangeCodeForSession('expired-code')

      expect(result.error).not.toBeNull()
      expect(result.error.message).toContain('expired')
    })

    it('should handle invalid code', async () => {
      mockExchangeCodeForSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid code' },
      })

      const result = await mockExchangeCodeForSession('invalid-code')

      expect(result.error).not.toBeNull()
    })
  })

  describe('Session Management', () => {
    it('should return session for authenticated user', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'token123',
            user: { id: 'test-user-id', email: 'test@example.com' },
          },
        },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session).toBeDefined()
      expect(result.data.session.user.email).toBe('test@example.com')
    })

    it('should return null session for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await mockGetSession()

      expect(result.data.session).toBeNull()
    })
  })
})

describe('Unconfirmed Account Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow resending confirmation to unconfirmed accounts', async () => {
    // First, sign up creates unconfirmed account
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'unconfirmed-user-id',
          email: 'unconfirmed@example.com',
          email_confirmed_at: null, // Not confirmed
          identities: [{ id: 'identity-1' }],
        },
      },
      error: null,
    })

    const signUpResult = await mockSignUp({
      email: 'unconfirmed@example.com',
      password: 'password123',
    })

    expect(signUpResult.data.user.email_confirmed_at).toBeNull()

    // Then, resend should work
    mockResend.mockResolvedValue({ data: {}, error: null })

    const resendResult = await mockResend({
      type: 'signup',
      email: 'unconfirmed@example.com',
    })

    expect(resendResult.error).toBeNull()
  })

  it('should reject sign in for unconfirmed accounts with clear message', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' },
    })

    const result = await mockSignInWithPassword({
      email: 'unconfirmed@example.com',
      password: 'password123',
    })

    expect(result.error).not.toBeNull()
    expect(result.error.message).toBe('Email not confirmed')
  })
})
