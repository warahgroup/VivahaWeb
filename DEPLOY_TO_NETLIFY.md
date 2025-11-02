# Deploy VivahaWeb to Netlify - Complete Guide

## ✅ Setup Complete!

All necessary files have been created:
- ✅ `netlify.toml` - Build configuration
- ✅ `netlify/functions/api.ts` - Serverless function wrapper
- ✅ Dependencies installed (`serverless-http`, `@netlify/functions`)
- ✅ `package.json` scripts updated

## 🚀 Deployment Steps

### Step 1: Install Netlify CLI (if not installed)
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```
Follow the browser prompts to authorize.

### Step 3: Build the Client First
```bash
cd client
npm run build
cd ..
```
This creates `client/dist` which Netlify will serve as your static frontend.

### Step 4: Initialize Netlify Site
```bash
netlify init
```
**When prompted:**
- Create & configure new site? **Yes**
- Team: Select your team
- Site name: `vivahaweb-prod` (or your choice)
- Deploy with Git? **No** (for manual deploy)
- Build command: `cd client && npm run build`
- Publish directory: `client/dist`
- Functions directory: `netlify/functions`

### Step 5: Deploy to Production
```bash
netlify deploy --prod --build
```

This will:
1. Build your frontend (`client/dist`)
2. Bundle your serverless functions
3. Deploy everything to Netlify
4. Give you a URL like: `https://vivahaweb-prod.netlify.app`

### Step 6: Test Your Deployment
- Visit your site URL
- Test the landing page
- Test mock login
- Test chat interface
- Verify API calls work

## 🔧 Local Testing

Before deploying, test locally:
```bash
netlify dev
```
This runs:
- Frontend at `http://localhost:8888`
- Backend functions at `http://localhost:8888/.netlify/functions/api`
- Simulates production environment

## 📝 Important Notes

### Database Configuration
Your app uses Drizzle ORM with Neon. You'll need to:
1. Set environment variables in Netlify Dashboard:
   - `DATABASE_URL` - Your Neon database connection string
2. Go to: Site Settings > Environment Variables

### API Routes
All API routes are automatically proxied:
- `/api/auth/login` → `/.netlify/functions/api/api/auth/login`
- `/api/chat/messages/:userId` → `/.netlify/functions/api/api/chat/messages/:userId`
- Frontend calls will work seamlessly!

### Continuous Deployment (Optional)
After initial deploy:
```bash
git remote add origin <your-repo-url>
git push origin main
```
Then in Netlify Dashboard:
- Site Settings > Build & Deploy > Continuous Deployment
- Connect your Git repository
- Auto-deploy on every push!

## 🎯 What Was Done

1. **netlify.toml**: Configured build settings, functions, and redirects
2. **netlify/functions/api.ts**: Wrapped Express app for serverless
3. **server/routes.ts**: Updated to work with serverless
4. **package.json**: Added build scripts
5. Installed dependencies for Netlify functions

## ⚠️ Important Considerations

- **Function Timeout**: 10 seconds (free tier)
- **Memory Limit**: 128MB per function
- **Function Invocations**: 125,000/month (free tier)
- **Bandwidth**: 100GB/month (free tier)

For heavy database operations, consider:
- Using Neon's connection pooling
- Implementing caching
- Optimizing queries

## 🔍 Troubleshooting

### Build Fails
```bash
netlify deploy --prod --build --debug
```
Check logs for specific errors.

### Functions Not Working
```bash
netlify functions:build
netlify dev
```
Test functions locally.

### Database Connection Issues
1. Verify `DATABASE_URL` in environment variables
2. Ensure database is accessible (not IP-restricted)
3. Test connection in function logs

## 📊 Netlify Dashboard
- Site overview: `https://app.netlify.com`
- Function logs: Site > Functions > View logs
- Deploy logs: Site > Deploys

## 🎉 Success!
Once deployed, your site will be live at:
`https://your-site-name.netlify.app`

Happy deploying! 🚀



