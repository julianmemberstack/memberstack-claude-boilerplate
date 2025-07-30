import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_MEMBERSTACK_KEY = 'pk_test_mock_key_for_testing'

// Mock Memberstack DOM
jest.mock('@memberstack/dom', () => ({
  getMemberstack: jest.fn(() => ({
    getCurrentMember: jest.fn(),
    loginMemberEmailPassword: jest.fn(),
    logout: jest.fn(),
    onAuthChange: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
}))

// Global test utilities
global.mockMember = {
  id: 'test-member-id',
  verified: true,
  auth: {
    email: 'test@example.com',
    hasPassword: true,
    providers: [],
  },
  planConnections: [
    {
      id: 'test-connection-1',
      planId: 'pln_free',
      active: true,
      status: 'active',
      type: 'subscription',
    },
  ],
  permissions: ['read'],
  customFields: {},
  metaData: {},
  createdAt: '2023-01-01T00:00:00Z',
}

global.mockPremiumMember = {
  ...global.mockMember,
  planConnections: [
    {
      id: 'test-connection-2',
      planId: 'pln_premium',
      active: true,
      status: 'active',
      type: 'subscription',
    },
  ],
  permissions: ['read', 'write'],
}