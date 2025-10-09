# API Endpoints Fixed for Azure Deployment

## Issue
The frontend was calling incorrect API endpoints, resulting in 404 errors. The backend API uses `/api/[Controller]` pattern with PascalCase controller names.

## Changes Made

### 1. Environment Variable Configuration
- Added fallback URL: `https://sherinetravels-api-frcsb2d3drabgbbd.eastasia-01.azurewebsites.net`
- Updated `next.config.mjs` to explicitly expose `NEXT_PUBLIC_API_BASE_URL`
- Added comprehensive logging to track API URL values

### 2. API Endpoint Corrections

#### Authentication Endpoints (`lib/auth.ts`)
- ❌ Old: `/auth/login`
- ✅ New: `/api/Auth/login`

- ❌ Old: `/auth/register`
- ✅ New: `/api/Auth/register`

#### Vehicle Endpoints
**File: `app/dashboard/user/vehicles/page.tsx`**
- ❌ Old: `/vehicle/available`
- ✅ New: `/api/Vehicle/available`

**File: `app/dashboard/manager/assignvehicles/page.tsx`**
- ❌ Old: `/vehicle` (GET all)
- ✅ New: `/api/Vehicle`

- ❌ Old: `/vehicle/{id}` (PUT)
- ✅ New: `/api/Vehicle/{id}`

- ❌ Old: `/vehicle` (POST)
- ✅ New: `/api/Vehicle`

- ❌ Old: `/vehicle/{id}` (DELETE)
- ✅ New: `/api/Vehicle/{id}`

#### Driver Endpoints
**File: `app/dashboard/manager/assigndrivers/page.tsx`**
- ❌ Old: `/driver` (GET all)
- ✅ New: `/api/Driver`

- ❌ Old: `/driver/{id}` (PUT)
- ✅ New: `/api/Driver/{id}`

- ❌ Old: `/driver` (POST)
- ✅ New: `/api/Driver`

- ❌ Old: `/driver/{id}` (DELETE)
- ✅ New: `/api/Driver/{id}`

## Files Modified
1. `lib/auth.ts` - Authentication service
2. `app/dashboard/user/vehicles/page.tsx` - User vehicle browsing
3. `app/dashboard/manager/assignvehicles/page.tsx` - Vehicle management
4. `app/dashboard/manager/assigndrivers/page.tsx` - Driver management
5. `next.config.mjs` - Next.js configuration
6. `ENV_SETUP.md` - Environment setup documentation

## Next Steps
1. Commit all changes
2. Push to repository
3. Redeploy to Azure
4. Test login and other API calls
5. Check browser console for `[AUTH CONFIG]` logs to verify URL is loaded correctly

## Testing Checklist
- [ ] Login works
- [ ] Signup works
- [ ] User can view available vehicles
- [ ] Manager can add/edit/delete vehicles
- [ ] Manager can add/edit/delete drivers
- [ ] All API calls return 200/201 instead of 404
