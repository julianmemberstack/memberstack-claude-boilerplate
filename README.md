# 🚀 Memberstack + Claude Code Boilerplate

The **easiest way to vibe code an app** with secure authentication powered by **Memberstack**, clean frontend powered by **shadcn/ui**, and coding on steroids with **Claude Code**. Perfect for building SaaS applications, membership sites, and any project where you want to ship fast without compromising on quality.

## ⚡ 60-Second Quick Start

```bash
# 1. Clone the repository (10 seconds)
git clone https://github.com/julianmemberstack/memberstack-claude-boilerplate.git my-app
cd my-app

# 2. Install and setup (30 seconds)
npm install

# 3. Run the setup wizard (20 seconds)
npm run setup
# The wizard will guide you through getting your Memberstack API keys

# 4. Start building! 🎉
npm run dev
```

**That's it!** Visit [http://localhost:3000](http://localhost:3000) and you'll see your authenticated app running.

### 🎯 What just happened?

1. ✅ **Dependencies installed** - All packages ready to go
2. ✅ **Environment configured** - Your `.env.local` file was created
3. ✅ **Memberstack connected** - Authentication system is live
4. ✅ **Plans configured** - Your pricing tiers are set up
5. ✅ **Ready to customize** - Start building your features!

### 🚨 Common Issues?

- **"I don't have a Memberstack account"** → [Sign up free at memberstack.com](https://memberstack.com)
- **"Where do I find my API keys?"** → [app.memberstack.com](https://app.memberstack.com) → Settings → API Keys
- **"Setup failed"** → Check `/api/health` for diagnostics or run `npm run setup` again

## ✨ Features

### 🔐 Secure Authentication (Memberstack)
- **Zero-config auth** - Email/password and OAuth that just works
- **Plan-based access control** - Free, Premium, Enterprise tiers out of the box
- **Server-side protection** - Next.js middleware keeps content locked down
- **Component-level gating** - Show/hide features based on user plans
- **Feature toggles** - Perfect for freemium models

### 🎨 Beautiful UI (shadcn/ui)
- **Copy-paste components** - Beautiful, accessible components ready to customize
- **Professional dashboard** - Sidebar navigation that looks expensive
- **Dark mode ready** - Theme switching with zero effort
- **Mobile-first** - Responsive design that works everywhere
- **TypeScript native** - Full type safety throughout

### 🏗️ Coding on Steroids (Claude Code)
- **AI-optimized architecture** - Comprehensive docs in `.claude/` folder for instant context
- **Vibe-based development** - Ask Claude to build features, it just works
- **Type-safe everything** - Centralized config that prevents footguns
- **Debug mode built-in** - See what's happening when things break
- **Testing ready** - Jest setup so you can ship with confidence
- **Bundle analysis** - Know exactly what's making your app slow
- **Error boundaries** - Graceful failures that don't kill the vibe

## 🚀 Detailed Setup Guide

### Prerequisites
- Node.js 18+ installed
- A [Memberstack account](https://memberstack.com) (free plan available)
- **Recommended**: [Claude Code](https://claude.ai/code) with [Context7 MCP](https://github.com/context7-ai/mcp-server) for AI-powered development

### Option 1: Automatic Setup (Recommended)

The easiest way is to use our interactive setup wizard:

```bash
npm run setup
```

This wizard will:
- ✅ Check your environment
- ✅ Guide you to get your Memberstack API keys
- ✅ Create your `.env.local` file automatically
- ✅ Test your connection to Memberstack
- ✅ Configure your authentication plans
- ✅ Verify everything is working

### Option 2: Manual Setup

If you prefer to set things up manually:

#### 1. Clone and Install
```bash
git clone https://github.com/julianmemberstack/memberstack-claude-boilerplate.git
cd memberstack-claude-boilerplate
npm install
```

#### 2. Environment Configuration
```bash
# Create your environment file
cp .env.example .env.local

# Add your Memberstack key
# Get it from: https://app.memberstack.com → Settings → API Keys
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_public_key_here
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

### Quick Diagnostics

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to see:
- ✅ Environment configuration status
- ✅ API key validation
- ✅ Memberstack connection status
- ✅ Plan configuration status

### Common Issues & Solutions

**"Middleware Error" on startup**
```bash
# Solution: Run the setup wizard
npm run setup
```

**"Authentication not working"**
- Check if `.env.local` exists (not `.env`)
- Verify keys start with `pk_` and `sk_`
- Check browser console for detailed errors
- Visit `/api/health` for diagnostics

**"Plans not matching"**
```bash
# Regenerate auth config based on your Memberstack plans
npm run setup:memberstack
```

**"Cannot find module" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**"Setup wizard fails"**
1. Reset and try again: `npm run setup:reset`
2. Or manually create `.env.local`:
   ```
   NEXT_PUBLIC_MEMBERSTACK_KEY=pk_your_key
   ```
3. Restart the dev server: `npm run dev`
4. Visit [http://localhost:3000/setup](http://localhost:3000/setup)

**"I messed up the configuration"**
```bash
# Start over with a clean slate
npm run setup:reset
npm run setup
```

### Debug Mode
Enable detailed logging:
```typescript
// In lib/auth-config.ts
settings: {
  enableDebugMode: true
}
```

### Getting Help

- 📚 Check the guides in `.claude/` folder
- 🔍 Search [Memberstack docs](https://docs.memberstack.com)
- 💬 Ask Claude Code for help with implementation
- 🐛 [Report issues](https://github.com/your-repo/issues)

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