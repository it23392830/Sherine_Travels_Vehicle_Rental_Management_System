

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd sherine-travels

2. Backend (API)
cd backend
dotnet build Sherine.sln

# Run API on port 5000
dotnet run --project Sherine.Api/Sherine.Api.csproj --urls "http://localhost:5000"


Swagger: http://localhost:5000/swagger

Health check: http://localhost:5000/api/health

Dependencies

.NET 8 SDK

3. Frontend (React app)
cd frontend/web
npm install
npm run dev


Open: http://localhost:5173

Dependencies

Node.js 20+

4. Database (MySQL)
Option A: Local MySQL

Create schema and seed:

mysql -u root -p < infra/sql/001_schema.sql
mysql -u root -p < infra/sql/002_seed.sql


Set environment variable:

# Linux/macOS
export MYSQL_CONN="Server=localhost;Port=3306;Database=sherine;Uid=root;Pwd=root;SslMode=None;"

# Windows PowerShell
$env:MYSQL_CONN="Server=localhost;Port=3306;Database=sherine;Uid=root;Pwd=root;SslMode=None;"

Option B: Docker MySQL
cd infra/docker
docker-compose up -d db

5. Run with Docker (API + DB + Frontend)
cd infra/docker
docker-compose up --build


API → http://localhost:5000/swagger

Frontend → http://localhost:5173

MySQL → localhost:3306 (user=root, pass=root)

🤝 Team Workflow

Branching: main (protected), dev, feat/<feature-name>

PRs require 1 reviewer + green CI

Commit style: feat(bookings): add quote endpoint

✅ Sprint-1 Goal

Backend: Auth + Vehicle list/create

Frontend: Login + Vehicle page

Infra: Docker Compose up with API + DB

CI: GitHub Actions build + test

📌 Notes

Use .env for secrets (never commit real credentials).

Update launchSettings.json in API to fix port conflicts.

For MySQL errors, ensure DB is running and MYSQL_CONN is set.

🚀 You are ready to start coding!


---

## ⚙️ CI/CD (GitHub Actions)

### Overview
- Backend API deploy: `.github/workflows/main_sherinetravels-api.yml`
- Frontend web deploy: `.github/workflows/main_sherinetravels-web.yml`
- Triggers: runs on `push` to `main` and can be executed manually via "Run workflow".

### Backend: ASP.NET Core → Azure Web App
- Environment:
  - Sets up .NET SDK 9.x
  - Uses a CI `NuGet.config` (no fallback folders) and local `NUGET_PACKAGES` cache
- Build & Publish:
  - Restore and build `backend/Sherine.sln`
  - Publish `backend/Sherine.Api/Sherine.Api.csproj` to `./publish`
  - Verifies `./publish` exists
- Artifact:
  - Uploads artifact named `dotnet-app` from `./publish`
- Deploy:
  - Downloads `dotnet-app` into `./publish`
  - Deploys folder `./publish` to Azure Web App `sherinetravels-api`

Required Secrets (Repository → Settings → Secrets and variables → Actions):
- `AZUREAPPSERVICE_CLIENTID_B350082FE02C446B9EDF8BD4B3E23FBE`
- `AZUREAPPSERVICE_TENANTID_5CF516035A16486C8CF9D128DBA68974`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_50133FC329BE44FE900BB49FC78CFABB`

Permissions
- The deploy job needs: `permissions: actions: read, contents: read, id-token: write` (already configured).

### Frontend: Next.js → Azure Web App
- Environment:
  - Node.js 20.x
  - Runs in `working-directory: ./frontend/web`
- Build:
  - `npm install`
  - `npm run build` (Next.js 15 app router)
- Artifact:
  - Uploads `node-app` (directory root of the checked-out repo for deployment)
- Deploy:
  - Downloads `node-app`
  - Deploys to Azure Web App `sherinetravels-web`

Notes
- If multiple lockfiles are present, Next.js may warn about root detection. You can set `outputFileTracingRoot` in `frontend/web/next.config.mjs` or keep current setup.

### How to Run Workflows Manually
1. Go to GitHub → Actions → select a workflow → Run workflow.
2. Ensure secrets exist and are valid.
3. Confirm the build job finishes and uploads an artifact before the deploy job begins.

### Common Issues & Fixes
- Artifact not found (download):
  - Ensure the build job uploaded `dotnet-app`/`node-app` in the same run.
  - Do not pass `repository`/`run-id` unless you intend to fetch from a different run.
- `./publish` missing:
  - The publish step must target `backend/Sherine.Api/Sherine.Api.csproj` and output to `./publish`.
  - We verify contents prior to upload; check logs for the verify step.
- NuGet fallback folder error on Linux:
  - We generate a CI `NuGet.config` that clears fallback folders and point restore/publish to it.
- NETSDK1004 project.assets.json not found:
  - Explicit restore of `Sherine.Api.csproj` runs before publish; re-run if caches were purged.
- Next.js build error: `useSearchParams() should be wrapped in a suspense boundary`:
  - `frontend/web/app/oauth-bridge/page.tsx` updated to render hook logic inside `<Suspense>`.
- Frontend `working-directory` invalid:
  - Fixed to `./frontend/web` so `npm` runs in the app folder.

### Local Testing of CI Steps
Backend (approximation):
```bash
dotnet restore backend/Sherine.sln --configfile ./NuGet.config
dotnet restore backend/Sherine.Api/Sherine.Api.csproj --configfile ./NuGet.config
dotnet build backend/Sherine.sln -c Release --no-restore
dotnet publish backend/Sherine.Api/Sherine.Api.csproj -c Release -o ./publish --configfile ./NuGet.config
ls -la ./publish
```

Frontend:
```bash
cd frontend/web
npm ci || npm install
npm run build
```

### Azure App Service Targets
- API: `sherinetravels-api` (Production slot)
- Web: `sherinetravels-web` (Production slot)

If you change app names or slots, update the corresponding `app-name`, `slot-name`, and artifact paths in the workflow files.
