# Environment Variables Setup

## Required Environment Variables

### 1. NEXT_PUBLIC_API_BASE_URL
The base URL for your backend API.

**Local Development:**
1. Copy the `env.template` file to `.env.local`:
   ```bash
   cp env.template .env.local
   ```
2. Edit `.env.local` and fill in your actual values:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

### 2. Google OAuth Configuration (Required for "Sign in with Google")

You need to set up Google OAuth credentials and configure the following environment variables:

**Required Variables:**
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-frontend-url.azurestaticapps.net
```

**How to Get Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if not done
6. Select **Web application** as application type
7. Add authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For Azure: `https://your-frontend-url.azurestaticapps.net/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret**

**Generate NEXTAUTH_SECRET:**
Run this command in terminal:
```bash
openssl rand -base64 32
```
Or use any random string generator (minimum 32 characters)

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
