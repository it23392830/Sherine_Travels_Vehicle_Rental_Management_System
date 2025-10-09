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

#### User Endpoints
**File: `app/dashboard/manager/settings/page.tsx`**
- ❌ Old: `/user/me` (GET)
- ✅ New: `/api/User/me`

- ❌ Old: `/user/profile` (PUT)
- ✅ New: `/api/User/profile`

- ❌ Old: `/user/change-password` (POST)
- ✅ New: `/api/User/change-password`

#### Booking Endpoints
**File: `app/dashboard/user/mybookings/page.tsx`**
- ❌ Old: `/booking` (GET all)
- ✅ New: `/api/Booking`

- ❌ Old: `/booking/{id}/cancel` (PUT)
- ✅ New: `/api/Booking/{id}/cancel`

#### OAuth Endpoints
**File: `app/oauth-bridge/page.tsx`**
- ❌ Old: `/auth/oauth` (POST)
- ✅ New: `/api/Auth/oauth`

## Files Modified
1. `lib/auth.ts` - Authentication service
2. `lib/api.ts` - API fetch helper (fixed base URL)
3. `app/dashboard/user/vehicles/page.tsx` - User vehicle browsing
4. `app/dashboard/manager/assignvehicles/page.tsx` - Vehicle management
5. `app/dashboard/manager/assigndrivers/page.tsx` - Driver management
6. `app/dashboard/manager/settings/page.tsx` - Manager settings
7. `app/dashboard/user/mybookings/page.tsx` - User bookings
8. `app/oauth-bridge/page.tsx` - OAuth authentication
9. `next.config.mjs` - Next.js configuration
10. `ENV_SETUP.md` - Environment setup documentation

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
