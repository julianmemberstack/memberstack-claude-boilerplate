/**
 * @jest-environment jsdom
 */

import {
  hasRouteAccess,
  hasFeatureAccess,
  hasPlan,
  getActivePlans,
  getPrimaryPlan,
  getMemberFeatures,
  getMemberPermissions,
  canUpgradeToPlan,
  getRecommendedPlanForFeature,
} from '@/lib/auth-utils'
import type { Member } from '@/lib/auth-utils'

describe('Auth Utils', () => {
  describe('hasPlan', () => {
    it('should return true when member has the required plan', () => {
      const member = global.mockMember as Member
      expect(hasPlan(member, 'pln_free')).toBe(true)
    })

    it('should return false when member does not have the required plan', () => {
      const member = global.mockMember as Member
      expect(hasPlan(member, 'pln_premium')).toBe(false)
    })

    it('should return false when member is null', () => {
      expect(hasPlan(null, 'pln_free')).toBe(false)
    })

    it('should work with array of plan IDs', () => {
      const member = global.mockMember as Member
      expect(hasPlan(member, ['pln_free', 'pln_premium'])).toBe(true)
      expect(hasPlan(member, ['pln_premium', 'pln_enterprise'])).toBe(false)
    })
  })

  describe('hasRouteAccess', () => {
    it('should allow access to public routes', () => {
      const result = hasRouteAccess(null, '/')
      expect(result.hasAccess).toBe(true)
    })

    it('should deny access to protected routes without authentication', () => {
      const result = hasRouteAccess(null, '/dashboard')
      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('Authentication required')
    })

    it('should allow access to dashboard for authenticated free user', () => {
      const member = global.mockMember as Member
      const result = hasRouteAccess(member, '/dashboard')
      expect(result.hasAccess).toBe(true)
    })

    it('should deny access to premium routes for free users', () => {
      const member = global.mockMember as Member
      const result = hasRouteAccess(member, '/premium')
      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('Plan upgrade required')
    })

    it('should allow access to premium routes for premium users', () => {
      const member = global.mockPremiumMember as Member
      const result = hasRouteAccess(member, '/premium')
      expect(result.hasAccess).toBe(true)
    })
  })

  describe('hasFeatureAccess', () => {
    it('should deny access to unknown features', () => {
      const member = global.mockMember as Member
      const result = hasFeatureAccess(member, 'unknown-feature')
      expect(result.hasAccess).toBe(false)
      expect(result.reason).toContain('Unknown feature')
    })

    it('should deny advanced analytics to free users', () => {
      const member = global.mockMember as Member
      const result = hasFeatureAccess(member, 'advanced-analytics')
      expect(result.hasAccess).toBe(false)
      expect(result.reason).toBe('Plan upgrade required')
    })

    it('should allow basic features to free users', () => {
      const member = global.mockMember as Member
      const result = hasFeatureAccess(member, 'basic-support')
      expect(result.hasAccess).toBe(true)
    })

    it('should allow advanced analytics to premium users', () => {
      const member = global.mockPremiumMember as Member
      const result = hasFeatureAccess(member, 'advanced-analytics')
      expect(result.hasAccess).toBe(true)
    })
  })

  describe('getActivePlans', () => {
    it('should return active plans for a member', () => {
      const member = global.mockMember as Member
      const plans = getActivePlans(member)
      expect(plans).toHaveLength(1)
      expect(plans[0].id).toBe('pln_free')
    })

    it('should return empty array for null member', () => {
      const plans = getActivePlans(null)
      expect(plans).toHaveLength(0)
    })

    it('should sort plans by priority (highest first)', () => {
      const member = {
        ...global.mockMember,
        planConnections: [
          {
            id: 'conn-1',
            planId: 'pln_free',
            active: true,
            status: 'active',
            type: 'subscription',
          },
          {
            id: 'conn-2',
            planId: 'pln_premium',
            active: true,
            status: 'active',
            type: 'subscription',
          },
        ],
      } as Member

      const plans = getActivePlans(member)
      expect(plans[0].id).toBe('pln_premium') // Higher priority
      expect(plans[1].id).toBe('pln_free')
    })
  })

  describe('getPrimaryPlan', () => {
    it('should return the highest priority plan', () => {
      const member = global.mockPremiumMember as Member
      const plan = getPrimaryPlan(member)
      expect(plan?.id).toBe('pln_premium')
    })

    it('should return null for null member', () => {
      const plan = getPrimaryPlan(null)
      expect(plan).toBeNull()
    })
  })

  describe('getMemberFeatures', () => {
    it('should return features for free member', () => {
      const member = global.mockMember as Member
      const features = getMemberFeatures(member)
      expect(features).toContain('basic-support')
      expect(features).toContain('core-features')
      expect(features).not.toContain('advanced-analytics')
    })

    it('should return features for premium member', () => {
      const member = global.mockPremiumMember as Member
      const features = getMemberFeatures(member)
      expect(features).toContain('advanced-analytics')
      expect(features).toContain('api-access')
    })
  })

  describe('getMemberPermissions', () => {
    it('should return permissions for free member', () => {
      const member = global.mockMember as Member
      const permissions = getMemberPermissions(member)
      expect(permissions).toContain('read')
      expect(permissions).not.toContain('write')
    })

    it('should return permissions for premium member', () => {
      const member = global.mockPremiumMember as Member
      const permissions = getMemberPermissions(member)
      expect(permissions).toContain('read')
      expect(permissions).toContain('write')
    })
  })

  describe('canUpgradeToPlan', () => {
    it('should allow free user to upgrade to premium', () => {
      const member = global.mockMember as Member
      expect(canUpgradeToPlan(member, 'pln_premium')).toBe(true)
    })

    it('should not allow premium user to downgrade to free', () => {
      const member = global.mockPremiumMember as Member
      expect(canUpgradeToPlan(member, 'pln_free')).toBe(false)
    })

    it('should allow anyone to sign up', () => {
      expect(canUpgradeToPlan(null, 'pln_free')).toBe(true)
    })
  })

  describe('getRecommendedPlanForFeature', () => {
    it('should recommend premium plan for advanced analytics', () => {
      const plan = getRecommendedPlanForFeature('advanced-analytics')
      expect(plan?.id).toBe('pln_premium')
    })

    it('should recommend free plan for basic features', () => {
      const plan = getRecommendedPlanForFeature('basic-support')
      expect(plan?.id).toBe('pln_free')
    })

    it('should return null for unknown features', () => {
      const plan = getRecommendedPlanForFeature('unknown-feature')
      expect(plan).toBeNull()
    })
  })
})