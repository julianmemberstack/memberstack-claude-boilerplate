/**
 * @jest-environment jsdom
 */

import { authConfig, validateAuthConfig } from '@/lib/auth-config'

describe('Auth Configuration', () => {
  describe('Configuration Structure', () => {
    it('should have valid route configuration', () => {
      expect(authConfig.routes).toBeDefined()
      expect(authConfig.routes.protected).toBeInstanceOf(Array)
      expect(authConfig.routes.public).toBeInstanceOf(Array)
      expect(authConfig.routes.redirects).toBeDefined()
    })

    it('should have valid plan configuration', () => {
      expect(authConfig.plans).toBeDefined()
      expect(typeof authConfig.plans).toBe('object')
      
      // Check that all plans have required properties
      Object.values(authConfig.plans).forEach(plan => {
        expect(plan.id).toBeDefined()
        expect(plan.name).toBeDefined()
        expect(plan.features).toBeInstanceOf(Array)
        expect(plan.permissions).toBeInstanceOf(Array)
        expect(typeof plan.priority).toBe('number')
      })
    })

    it('should have valid content gating configuration', () => {
      expect(authConfig.contentGating).toBeDefined()
      expect(authConfig.contentGating.components).toBeDefined()
      expect(authConfig.contentGating.features).toBeDefined()
    })

    it('should have valid settings', () => {
      expect(authConfig.settings).toBeDefined()
      expect(typeof authConfig.settings.enableDebugMode).toBe('boolean')
      expect(typeof authConfig.settings.sessionTimeout).toBe('number')
      expect(typeof authConfig.settings.redirectDelay).toBe('number')
    })
  })

  describe('Plan Hierarchy', () => {
    it('should have correct plan priorities', () => {
      const { plans } = authConfig
      
      expect(plans.pln_free.priority).toBeLessThan(plans.pln_premium.priority)
      expect(plans.pln_premium.priority).toBeLessThan(plans.pln_enterprise.priority)
    })

    it('should have cumulative features (higher plans include lower plan features)', () => {
      const { plans } = authConfig
      
      // Premium should have more features than Free
      expect(plans.pln_premium.features.length).toBeGreaterThan(plans.pln_free.features.length)
      
      // Enterprise should have more features than Premium
      expect(plans.pln_enterprise.features.length).toBeGreaterThan(plans.pln_premium.features.length)
    })
  })

  describe('Route Protection', () => {
    it('should protect dashboard routes', () => {
      const dashboardRoute = authConfig.routes.protected.find(route => route.path === '/dashboard')
      expect(dashboardRoute).toBeDefined()
      expect(dashboardRoute?.allowUnauthenticated).toBe(false)
    })

    it('should have public routes for essential pages', () => {
      const essentialRoutes = ['/', '/login', '/signup', '/pricing']
      essentialRoutes.forEach(route => {
        expect(authConfig.routes.public).toContain(route)
      })
    })

    it('should have proper redirect URLs', () => {
      const { redirects } = authConfig.routes
      
      Object.values(redirects).forEach(url => {
        expect(url).toMatch(/^\//) // Should start with /
        expect(typeof url).toBe('string')
      })
    })
  })

  describe('Feature Mapping', () => {
    it('should map features to appropriate plans', () => {
      const { features } = authConfig.contentGating
      
      // Basic features should be available to all plans
      expect(features['basic-support']).toContain('pln_free')
      expect(features['basic-support']).toContain('pln_premium')
      expect(features['basic-support']).toContain('pln_enterprise')
      
      // Advanced features should only be available to premium and enterprise
      expect(features['advanced-analytics']).not.toContain('pln_free')
      expect(features['advanced-analytics']).toContain('pln_premium')
      expect(features['advanced-analytics']).toContain('pln_enterprise')
      
      // Enterprise features should only be available to enterprise
      if (features['white-label']) {
        expect(features['white-label']).not.toContain('pln_free')
        expect(features['white-label']).not.toContain('pln_premium')
        expect(features['white-label']).toContain('pln_enterprise')
      }
    })
  })

  describe('Configuration Validation', () => {
    it('should pass validation without errors', () => {
      const errors = validateAuthConfig(authConfig)
      expect(errors).toHaveLength(0)
    })

    it('should detect invalid plan references', () => {
      const invalidConfig = {
        ...authConfig,
        routes: {
          ...authConfig.routes,
          protected: [
            {
              path: '/invalid',
              requiredPlans: ['non_existent_plan'],
              allowUnauthenticated: false,
            },
          ],
        },
      }
      
      const errors = validateAuthConfig(invalidConfig)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('non_existent_plan')
    })

    it('should detect invalid redirect paths', () => {
      const invalidConfig = {
        ...authConfig,
        routes: {
          ...authConfig.routes,
          redirects: {
            ...authConfig.routes.redirects,
            unauthenticated: 'invalid-path', // Should start with /
          },
        },
      }
      
      const errors = validateAuthConfig(invalidConfig)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('invalid-path')
    })
  })

  describe('Component Gating Rules', () => {
    it('should have gating rules for key components', () => {
      const { components } = authConfig.contentGating
      
      // Should have rules for important components
      const importantComponents = [
        'AnalyticsDashboard',
        'AdminPanel',
        'APIAccessCard',
        'ExportButton',
      ]
      
      importantComponents.forEach(componentName => {
        if (components[componentName]) {
          expect(components[componentName].component).toBe(componentName)
        }
      })
    })
  })
})