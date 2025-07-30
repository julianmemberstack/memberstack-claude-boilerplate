/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthDemo from '@/app/components/AuthDemo'

// Mock the MemberstackProvider
const mockMemberstack = {
  loginMemberEmailPassword: jest.fn(),
  signupMemberEmailPassword: jest.fn(),
  logout: jest.fn(),
}

const mockContextValue = {
  memberstack: mockMemberstack,
  member: null,
  isLoading: false,
}

// Mock the context
jest.mock('@/app/components/MemberstackProvider', () => ({
  useMemberstack: () => mockContextValue,
}))

// Mock the AuthConfigContext
jest.mock('@/contexts/AuthConfigContext', () => ({
  useAuthConfig: () => ({
    getAccessDebugInfo: jest.fn(() => ({ member: {}, route: {} })),
  }),
}))

describe('AuthDemo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders login form by default', () => {
    render(<AuthDemo />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to signup form when signup tab is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthDemo />)
    
    const signupTab = screen.getByText('Sign Up')
    await user.click(signupTab)
    
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('handles login form submission', async () => {
    const user = userEvent.setup()
    mockMemberstack.loginMemberEmailPassword.mockResolvedValue({
      data: { id: 'test-user' },
    })
    
    render(<AuthDemo />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockMemberstack.loginMemberEmailPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('handles signup form submission', async () => {
    const user = userEvent.setup()
    mockMemberstack.signupMemberEmailPassword.mockResolvedValue({
      data: { id: 'test-user' },
    })
    
    render(<AuthDemo />)
    
    // Switch to signup tab
    const signupTab = screen.getByText('Sign Up')
    await user.click(signupTab)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'newpassword123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockMemberstack.signupMemberEmailPassword).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'newpassword123',
      })
    })
  })

  it('displays error messages for invalid input', async () => {
    const user = userEvent.setup()
    mockMemberstack.loginMemberEmailPassword.mockRejectedValue({
      message: 'Invalid credentials',
    })
    
    render(<AuthDemo />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'short')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during authentication', async () => {
    const user = userEvent.setup()
    mockMemberstack.loginMemberEmailPassword.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 100))
    )
    
    render(<AuthDemo />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })

  it('displays member information when authenticated', () => {
    const authenticatedContextValue = {
      ...mockContextValue,
      member: {
        id: 'test-user',
        auth: { email: 'test@example.com' },
        planConnections: [
          { planId: 'pln_free', active: true, status: 'active' },
        ],
      },
    }

    jest.doMock('@/app/components/MemberstackProvider', () => ({
      useMemberstack: () => authenticatedContextValue,
    }))

    // Re-import component with new mock
    const AuthDemoAuthenticated = require('@/app/components/AuthDemo').default
    render(<AuthDemoAuthenticated />)
    
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('handles logout', async () => {
    const user = userEvent.setup()
    const authenticatedContextValue = {
      ...mockContextValue,
      member: {
        id: 'test-user',
        auth: { email: 'test@example.com' },
        planConnections: [],
      },
    }

    jest.doMock('@/app/components/MemberstackProvider', () => ({
      useMemberstack: () => authenticatedContextValue,
    }))

    const AuthDemoAuthenticated = require('@/app/components/AuthDemo').default
    render(<AuthDemoAuthenticated />)
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)
    
    expect(mockMemberstack.logout).toHaveBeenCalled()
  })
})