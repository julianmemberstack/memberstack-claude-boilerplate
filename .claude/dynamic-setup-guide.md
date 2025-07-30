# Dynamic Memberstack Setup Guide

## 🚀 Overview

This boilerplate now includes **dynamic plan configuration** that automatically generates auth rules based on your existing Memberstack plans. No more manually configuring plan IDs - just create your plans in Memberstack and let the system do the rest!

## 🔄 How It Works

### 1. **API Integration**
- Uses Memberstack's REST API to fetch all your plans
- Analyzes plan structure (pricing, names, features) 
- Generates intelligent configuration suggestions
- Creates type-safe auth rules automatically

### 2. **Smart Analysis**
The system analyzes your plans and automatically:
- **Sorts by price** (free first, then ascending)
- **Assigns priorities** based on pricing tiers
- **Suggests features** based on plan names and prices
- **Creates permissions** (read/write/admin) by tier
- **Maps routes** to appropriate access levels

### 3. **Claude Integration**
- Provides API endpoint for Claude to analyze your setup
- Generates personalized recommendations
- Offers setup guidance based on your specific plans

## 🛠️ Setup Methods

### Method 1: Automated Script (Recommended)

```bash
# 1. Set up your environment
cp .env.example .env.local

# 2. Add your Memberstack keys
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_sb_your_public_key_here
MEMBERSTACK_SECRET_KEY=sk_your_secret_key_here

# 3. Create plans in Memberstack dashboard (any structure you want)

# 4. Auto-generate configuration
npm run setup:memberstack
```

The script will:
- ✅ Fetch your plans from Memberstack
- ✅ Analyze pricing and naming patterns
- ✅ Generate `lib/auth-config.ts` automatically
- ✅ Provide setup recommendations
- ✅ Show configuration summary

### Method 2: Claude Analysis

```bash
# Start your dev server
npm run dev

# Ask Claude to analyze your plans via the API
# Claude can call: GET http://localhost:3000/api/memberstack/plans
```

Claude can then:
- 📊 Analyze your plan structure
- 💡 Provide specific recommendations
- 🔧 Suggest configuration improvements
- 📝 Help customize features and permissions

## 📋 Configuration Generation Logic

### Plan Priority Assignment
```typescript
// Plans are sorted by price and assigned priorities:
Free/Basic ($0) → Priority 1 (Basic tier)
Premium ($29) → Priority 2 (Premium tier)  
Enterprise ($99) → Priority 3 (Enterprise tier)
```

### Feature Mapping
```typescript
// Features are suggested based on plan characteristics:

Basic Tier (Priority 1):
- profile-management
- basic-support
- core-features
- basic-analytics

Premium Tier (Priority 2):
- All basic features +
- priority-support
- advanced-analytics
- api-access
- export-data
- custom-branding

Enterprise Tier (Priority 3):
- All premium features +
- dedicated-support
- enterprise-features
- white-label
- sso
- audit-logs
```

### Route Access
```typescript
// Routes are mapped based on plan priorities:

All Plans:
- /dashboard
- /profile  
- /settings

Premium+ Plans:
- /premium
- /analytics
- /api-access

Enterprise Plans:
- /admin
- /enterprise
- /team-management
```

## 🎯 Smart Plan Detection

The system intelligently detects plan types based on:

### Pricing Analysis
- **$0 plans** → Basic/Free tier features
- **Low-mid pricing** → Premium tier features  
- **High pricing** → Enterprise tier features

### Name Pattern Recognition
- **"free", "basic"** → Basic tier classification
- **"premium", "pro", "plus"** → Premium tier classification
- **"enterprise", "business", "ultimate"** → Enterprise tier classification

### Custom Plan Structures
The system adapts to any plan structure:
- Single paid tier
- Multiple pricing levels
- Usage-based pricing
- Custom naming conventions

## 🔧 Customization After Generation

After running the setup, you can customize the generated `lib/auth-config.ts`:

### Adding Custom Features
```typescript
// Add your own features to any plan
plans: {
  "pln_your_plan": {
    // ... generated config
    features: [
      ...existingFeatures,
      "your-custom-feature",
      "another-feature"
    ]
  }
}
```

### Custom Route Protection
```typescript
// Add custom protected routes
routes: {
  protected: [
    // ... generated routes
    {
      path: "/your-custom-page",
      requiredPlans: ["pln_premium", "pln_enterprise"],
      customRedirect: "/pricing"
    }
  ]
}
```

### Component Gating Rules
```typescript
// Add custom component gating
contentGating: {
  components: {
    // ... generated components
    "YourCustomComponent": {
      component: "YourCustomComponent",
      requiredPlans: ["pln_premium"],
      requiredFeatures: ["your-feature"]
    }
  }
}
```

## 🚨 Security Considerations

### Environment Variables
```bash
# Required for setup (keep secure!)
MEMBERSTACK_SECRET_KEY=sk_your_secret_key_here  # SERVER-SIDE ONLY
NEXT_PUBLIC_MEMBERSTACK_KEY=pk_sb_your_key_here # CLIENT-SIDE OK
```

### API Endpoint Security
- `/api/memberstack/plans` only works in **development mode**
- Automatically disabled in production
- Requires valid secret key
- Returns detailed error messages for debugging

### Best Practices
- ✅ Keep secret keys in `.env.local` (not committed)
- ✅ Use separate keys for development/production
- ✅ Regenerate keys if compromised
- ✅ Review generated configuration before deployment

## 🎉 Benefits of Dynamic Setup

### For Developers
- **No manual configuration** - works with any plan structure
- **Type-safe generation** - no typos in plan IDs
- **Intelligent defaults** - smart feature mapping
- **Easy updates** - re-run when plans change

### For Claude Code Users
- **AI-friendly analysis** - Claude can understand your setup
- **Personalized recommendations** - based on your specific plans
- **Interactive setup** - ask Claude to analyze and optimize
- **Clear explanations** - understand why certain features are suggested

### For Businesses
- **Flexible pricing** - works with any plan structure
- **Quick iterations** - easy to test different pricing models
- **Professional setup** - enterprise-grade configuration
- **Scalable foundation** - grows with your business

## 🔍 Troubleshooting

### Common Issues

**"No plans found"**
- Check your Memberstack secret key
- Ensure you have created plans in the dashboard
- Verify API key permissions

**"Authentication failed"**
- Verify `MEMBERSTACK_SECRET_KEY` is correct
- Check key hasn't expired or been disabled
- Ensure key has read permissions for plans

**"Generated config looks wrong"**
- Review plan names and pricing in Memberstack
- Customize the generated config as needed
- Re-run setup after making plan changes

### Getting Help

1. **Check the generated suggestions** - they include reasoning
2. **Review the API response** - detailed analysis included
3. **Ask Claude** - use the analysis endpoint for personalized help
4. **Manual override** - edit `lib/auth-config.ts` directly if needed

## 🚀 Next Steps

After successful setup:

1. **Review generated config** - `lib/auth-config.ts`
2. **Test authentication flow** - `npm run dev`
3. **Customize as needed** - add your own features/routes
4. **Create protected pages** - using the generated plan IDs
5. **Deploy with confidence** - production-ready configuration

This dynamic setup makes the boilerplate truly plug-and-play with any Memberstack configuration!