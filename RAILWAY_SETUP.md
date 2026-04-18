# Railway Deployment Guide

This project uses pnpm monorepo with two deployable services:
- **API Server** (`artifacts/api-server`)
- **Frontend** (`artifacts/flowstock`)

## Quick Setup on Railway

### 1. Connect Repository
Go to [railway.app](https://railway.app) and create a new project by connecting this GitHub repository.

### 2. Create Two Services

#### Service 1: API Server
1. **New Service** → Select GitHub repo
2. **Settings:**
   - Service name: `api-server`
   - Root Directory: `artifacts/api-server`
   - Build Command: `pnpm run build`
   - Start Command: `pnpm run start`
3. **Environment Variables:**
   - `PORT=3000`
   - `NODE_ENV=production`
   - `DATABASE_URL=` (connect Railway PostgreSQL plugin)
   - `CLERK_SECRET_KEY=` (from Clerk dashboard)
   - Optional: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

#### Service 2: Flowstock (Frontend)
1. **New Service** → Select GitHub repo
2. **Settings:**
   - Service name: `flowstock`
   - Root Directory: `artifacts/flowstock`
   - Build Command: `pnpm run build`
   - Start Command: `pnpm run serve`
3. **Environment Variables (SET BEFORE BUILD):**
   - `PORT=3000`
   - `NODE_ENV=production`
   - `BASE_PATH=/`
   - `VITE_CLERK_PUBLISHABLE_KEY=` (from Clerk dashboard)
   - Optional: `VITE_CLERK_PROXY_URL=/api/__clerk` (to proxy auth through API server)

### 3. Connect Database

1. **Deploy PostgreSQL:**
   - In Railway, add service → PostgreSQL
   - Reference it in both services

2. **Automatic Connection:**
   - Railway will inject `DATABASE_URL` automatically
   - Both services will share the same database

### 4. Environment Variables Reference

| Variable | Service | Required | Example |
|----------|---------|----------|---------|
| `PORT` | Both | ✅ | `3000` |
| `NODE_ENV` | Both | ✅ | `production` |
| `DATABASE_URL` | Both | ✅ | `postgresql://...` |
| `CLERK_SECRET_KEY` | API Server | ✅ | `sk_live_...` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | ✅ | `pk_live_...` |
| `BASE_PATH` | Frontend | ✅ | `/` |
| `VITE_CLERK_PROXY_URL` | Frontend | ❌ | `/api/__clerk` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API Server | ❌ | `sk-...` |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | API Server | ❌ | `https://api.openai.com/v1` |

### 5. Deployment Order

Railway will deploy in parallel, but this order is ideal:
1. PostgreSQL (if not already created)
2. API Server (runs migrations, sets up database)
3. Flowstock (frontend)

### 6. Troubleshooting

**"pnpm: command not found"**
- Railway supports pnpm automatically. Check Nixpacks detection.

**"PORT is invalid"**
- Ensure `PORT` is set to a valid number (e.g., `3000`)
- Railway uses environment-specific port assignment; leave blank and Railway will set it.

**Frontend shows 404 errors**
- Check `BASE_PATH` is set correctly (usually `/`)
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set during build

**Clerk authentication fails**
- Verify `CLERK_SECRET_KEY` is correct on API Server
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct on Frontend
- Add Railway URL to Clerk allowed origins

**Database connection errors**
- Ensure PostgreSQL service is deployed first
- Add `DATABASE_URL` environment variable
- Check database user has proper permissions

### 7. Getting Clerk Keys

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Copy:
   - **Publishable Key** → Frontend (`VITE_CLERK_PUBLISHABLE_KEY`)
   - **Secret Key** → API Server (`CLERK_SECRET_KEY`)
5. Add Railway URLs to **Allowed URLs** in Clerk settings

## Files Included

- `railway.json` - Railway configuration
- `.env.example` - Template for environment variables
- `Procfile` - Process file for API Server (optional)
- `.npmrc` - pnpm configuration (allows flexible lockfile)

## Support

For issues, check:
- Railway [Documentation](https://docs.railway.app)
- Clerk [Documentation](https://clerk.com/docs)
- pnpm [Monorepo Guide](https://pnpm.io/workspaces)
