# Environment Variables Setup

## Required Environment Variables

### NEXT_PUBLIC_API_BASE_URL
The base URL for your backend API.

**Local Development:**
Create a `.env.local` file in the `frontend/web` directory:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

**Azure Deployment:**
1. Go to Azure Portal → Your App Service
2. Navigate to **Configuration** → **Application settings**
3. Click **New application setting**
4. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net`
5. Click **Save**
6. **IMPORTANT**: Rebuild and redeploy your application after setting this variable

**Note:** The application now has a fallback to the production API URL, so it will work even if the environment variable is not set. However, it's still recommended to set it properly in Azure for better configuration management.

## Why This Is Required

Next.js environment variables prefixed with `NEXT_PUBLIC_` are embedded into the JavaScript bundle at **build time**. This means:
- The variable must be set BEFORE running `npm run build`
- Changing it after build requires a rebuild
- It will be visible in the client-side JavaScript

## Troubleshooting

If you see "NEXT_PUBLIC_API_BASE_URL is not configured" error:
1. Verify the environment variable is set in Azure Application Settings
2. Ensure you rebuilt the application after setting the variable
3. Check browser console for the `[AUTH CONFIG]` logs to see the actual value
