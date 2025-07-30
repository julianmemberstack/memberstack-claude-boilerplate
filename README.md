# 🚀 Memberstack + Claude Code Boilerplate

A **premium, production-ready boilerplate** that combines the power of Memberstack authentication with modern web development tools. Perfect for building SaaS applications, membership sites, and any project requiring sophisticated user management and plan-based access control.

## ✨ Features

### 🔐 Authentication & Authorization
- **Memberstack Integration** - Complete user authentication with email/password and OAuth
- **Plan-Based Access Control** - Tiered access with Free, Premium, and Enterprise plans
- **Server-Side Protection** - Next.js middleware ensures content is never exposed
- **Component-Level Gating** - Fine-grained control over UI elements
- **Feature Toggles** - Show/hide functionality based on user plans

### 🎨 Modern UI & Design
- **shadcn/ui Components** - Beautiful, accessible, and customizable components
- **Professional Dashboard** - Sidebar navigation with responsive design
- **Dark Mode Ready** - Built-in theme support with Tailwind CSS
- **Mobile-First** - Responsive design that works on all devices
- **TypeScript** - Full type safety throughout the application

### 🏗️ Developer Experience
- **Claude Code Optimized** - Comprehensive documentation in `.claude/` folder
- **Type-Safe Configuration** - Centralized auth config with TypeScript
- **Environment Variables** - Secure configuration management
- **Development Debug Mode** - Built-in debugging utilities
- **Testing Ready** - Jest setup with sample tests included
- **Bundle Analysis** - Built-in bundle analyzer for optimization
- **Error Boundaries** - Graceful error handling with recovery options
- **Clean Architecture** - Well-organized, maintainable codebase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A [Memberstack account](https://memberstack.com) (free plan available)
- Basic knowledge of React and Next.js

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd memberstack-claude-boilerplate
npm install
```

### 2. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Add your Memberstack keys
# Get them from: https://app.memberstack.com/dashboard/app/[your-app]/keys
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_sb_your_public_key_here
MEMBERSTACK_SECRET_KEY=sk_your_secret_key_here
```

### 3. Create Your Plans in Memberstack
Create your pricing plans in the [Memberstack dashboard](https://app.memberstack.com) with whatever structure works for your business:

- **Free Plan** - Basic features
- **Premium Plan** - Advanced features  
- **Enterprise Plan** - Full access
- Or any custom structure that fits your needs!

### 4. Auto-Generate Configuration
Instead of manually configuring plans, let the boilerplate analyze your Memberstack setup:

```bash
# Automatically generate auth configuration from your Memberstack plans
npm run setup:memberstack
```

This will:
- ✅ Fetch all your plans from Memberstack
- ✅ Analyze pricing structure and features
- ✅ Generate optimized auth configuration
- ✅ Create plan-based access control rules
- ✅ Suggest features and permissions for each tier

### 5. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application! 🎉

### 🤖 Let Claude Help Configure Your Plans
You can also ask Claude to analyze your Memberstack setup:

```bash
# This creates an API endpoint Claude can use to analyze your plans
curl http://localhost:3000/api/memberstack/plans
```

Claude can then provide personalized recommendations for your specific plan structure!

## 🏗️ Project Structure

```
├── app/                          # Next.js App Router
│   ├── components/               # Reusable React components
│   │   ├── AuthDemo.tsx         # Authentication demo UI
│   │   └── MemberstackProvider.tsx # Auth context provider
│   ├── dashboard/               # Protected dashboard area
│   │   ├── components/          # Dashboard-specific components
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   └── page.tsx             # Dashboard home page
│   ├── lib/                     # Utility functions
│   │   ├── memberstack.ts       # Memberstack SDK setup
│   │   └── utils.ts             # General utilities
│   ├── globals.css              # Global styles and Tailwind
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing/authentication page
├── components/ui/               # shadcn/ui components
├── contexts/                    # React contexts
│   └── AuthConfigContext.tsx   # Auth configuration context
├── lib/                         # Core business logic
│   ├── auth-config.ts           # Centralized auth configuration
│   └── auth-utils.ts            # Auth utility functions
├── middleware.ts                # Next.js middleware for route protection
├── .claude/                     # Claude Code documentation
│   ├── project-overview.md      # Comprehensive project overview
│   ├── implementation-guide.md  # Implementation and customization guide
│   ├── auth-config-guide.md     # Authentication system documentation
│   └── memberstack-documentation.md # Memberstack SDK reference
└── README.md                    # This file
```

## 🔐 Authentication Flow

### Client-Side Authentication
1. **MemberstackProvider** wraps the app with auth context
2. Provides real-time auth state to all components
3. Handles login, logout, and signup operations
4. Manages session persistence with cookies

### Server-Side Protection
1. **Middleware** intercepts all requests
2. Validates user authentication and plan access
3. Redirects unauthorized users appropriately
4. Prevents exposure of protected content

### Plan-Based Access Control
- **Route-level**: Protect entire pages based on user plans
- **Component-level**: Show/hide UI elements conditionally
- **Feature-level**: Enable/disable functionality per plan

## 🎯 Key Components

### Dashboard
A professional dashboard with:
- **Responsive sidebar navigation** with plan-based menu items
- **User profile display** with current plan information
- **Feature showcase cards** with upgrade prompts
- **Usage metrics** and analytics (plan-gated)
- **Account management** and logout functionality

### Authentication Demo
A complete auth interface featuring:
- **Email/password authentication** with validation
- **Google OAuth integration** (ready to enable)
- **Tabbed login/signup interface** with shadcn/ui
- **Real-time auth state display**
- **Error handling and success messages**

### Middleware Protection
Automatic route protection with:
- **Plan-based route access** control
- **Custom redirect URLs** for different scenarios
- **Debug logging** in development mode
- **Efficient auth validation** with caching

## 🛠️ Customization

### Adding New Protected Routes
```typescript
// In lib/auth-config.ts
{
  path: "/new-feature",
  requiredPlans: ["pln_premium", "pln_enterprise"],
  customRedirect: "/pricing"
}
```

### Creating Plan-Gated Components
```typescript
import { useAuthConfig } from "@/contexts/AuthConfigContext";

export function PremiumFeature() {
  const { hasFeatureAccess } = useAuthConfig();
  const access = hasFeatureAccess(member, "premium-feature");
  
  return access.hasAccess ? (
    <PremiumContent />
  ) : (
    <UpgradePrompt />
  );
}
```

### Customizing Plans
```typescript
// Add new plans in lib/auth-config.ts
"pln_startup": {
  id: "pln_startup",
  name: "Startup Plan",
  features: ["team-collaboration", "advanced-analytics"],
  permissions: ["read", "write"],
  priority: 2.5
}
```

## 🎨 UI Customization

### Adding shadcn/ui Components
```bash
# Install any shadcn/ui component
npx shadcn@latest add [component-name]

# Examples:
npx shadcn@latest add table
npx shadcn@latest add chart
npx shadcn@latest add calendar
```

### Theming
- Modify CSS variables in `app/globals.css`
- Update Tailwind config for custom colors
- Use shadcn/ui theme generator for color schemes

## 🚀 Deployment

### Environment Variables
```bash
# Production environment
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_production_key
NODE_ENV=production
```

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms
```bash
# Build for production
npm run build
npm start
```

## 🧪 Development & Testing

### Available Scripts
```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Analysis
npm run analyze      # Analyze bundle size with webpack-bundle-analyzer
```

### Testing
The project includes a comprehensive test setup with Jest and React Testing Library:

```typescript
// Example: Testing auth utilities
import { hasRouteAccess } from "@/lib/auth-utils";

describe("Authentication", () => {
  it("should allow access to dashboard for authenticated users", () => {
    const mockMember = { 
      id: "123", 
      planConnections: [{ planId: "pln_free", active: true }] 
    };
    
    const result = hasRouteAccess(mockMember, "/dashboard");
    expect(result.hasAccess).toBe(true);
  });
});
```

### Bundle Analysis
Analyze your app's bundle size and dependencies:
```bash
npm run analyze
```
This will build your app and open a detailed bundle analysis report.

## 📚 Learning Resources

### Documentation
- [`.claude/project-overview.md`](.claude/project-overview.md) - Complete project architecture
- [`.claude/implementation-guide.md`](.claude/implementation-guide.md) - Customization guide
- [`.claude/auth-config-guide.md`](.claude/auth-config-guide.md) - Authentication system
- [`.claude/memberstack-documentation.md`](.claude/memberstack-documentation.md) - Memberstack SDK reference

### External Resources
- [Memberstack Documentation](https://docs.memberstack.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔧 Troubleshooting

### Common Issues

**Authentication not working?**
- Verify your `NEXT_PUBLIC_MEMBERSTACK_KEY` in `.env.local`
- Check browser console for errors
- Ensure Memberstack app is properly configured

**Routes not protected?**
- Check route configuration in `lib/auth-config.ts`
- Verify middleware matcher patterns
- Test with different user plan levels

**Components not gating properly?**
- Validate plan IDs match your Memberstack dashboard
- Check auth context is properly provided
- Review access control logic

### Debug Mode
Enable detailed logging by setting:
```typescript
// In lib/auth-config.ts
settings: {
  enableDebugMode: true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Use Cases

Perfect for building:
- **SaaS Applications** with tiered pricing
- **Membership Sites** with gated content
- **B2B Platforms** with role-based access
- **Educational Platforms** with course access
- **Community Platforms** with premium features
- **E-commerce Sites** with member benefits

## 🌟 Why This Boilerplate?

- **Production-Ready** - Battle-tested patterns and architecture
- **Developer-Friendly** - Comprehensive documentation and examples
- **Claude Code Optimized** - Built specifically for AI-assisted development
- **Scalable** - Designed to grow with your application
- **Secure** - Industry-standard authentication and authorization
- **Modern** - Latest Next.js, React, and TypeScript features

---

**Made with ❤️ for the Claude Code community**

*Ready to build something amazing? Start with this boilerplate and focus on what makes your product unique!*