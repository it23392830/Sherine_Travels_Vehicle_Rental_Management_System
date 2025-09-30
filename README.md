## CI/CD, Workflows, and DevOps

This repository uses GitHub Actions to build and deploy both the ASP.NET Core backend API and the Next.js frontend to Azure App Service. This document explains the pipelines, workflows, technologies, and branching strategy.

### Workflows

- Backend API workflow: `.github/workflows/main_sherinetravels-api.yml`
  - Triggers: `push` to `main`, and `workflow_dispatch` (manual run)
  - Jobs:
    - Build
      - Setup .NET SDK 9.x; print `dotnet --info`
      - Generate CI-only `NuGet.config` (clears fallback folders)
      - Clean `bin/obj` and restore `backend/Sherine.sln` and `backend/Sherine.Api/Sherine.Api.csproj`
      - Build solution `-c Release`
      - Publish `backend/Sherine.Api/Sherine.Api.csproj` to `./publish`
      - Verify `./publish` exists and upload artifact `dotnet-app`
    - Deploy (needs: build)
      - Permissions: `actions: read`, `contents: read`, `id-token: write`
      - Download artifact `dotnet-app` to `./publish`
      - Login to Azure using OIDC (`azure/login@v2`)
      - Deploy folder `./publish` to Azure Web App `sherinetravels-api` (slot `Production`)

- Frontend Web workflow: `.github/workflows/main_sherinetravels-web.yml`
  - Triggers: `push` to `main`, and `workflow_dispatch` (manual run)
  - Jobs:
    - Build
      - Setup Node.js 20.x
      - Working directory: `./frontend/web`
      - `npm install` → `npm run build`
      - Upload artifact `node-app`
    - Deploy (needs: build)
      - Permissions: `actions: read`, `contents: read`, `id-token: write`
      - Download artifact `node-app`
      - Login to Azure using OIDC (`azure/login@v2`)
      - Deploy to Azure Web App `sherinetravels-web` (slot `Production`)

### Required GitHub Secrets

Add these at: Repository → Settings → Secrets and variables → Actions

- `AZUREAPPSERVICE_CLIENTID_B350082FE02C446B9EDF8BD4B3E23FBE`
- `AZUREAPPSERVICE_TENANTID_5CF516035A16486C8CF9D128DBA68974`
- `AZUREAPPSERVICE_SUBSCRIPTIONID_50133FC329BE44FE900BB49FC78CFABB`

These are used by `azure/login@v2` for federated (OIDC) authentication to Azure; no service principal password is stored.

### Technologies & Techniques

- GitHub Actions runners (`ubuntu-latest`)
- .NET SDK 9.x, Node.js 20.x
- NuGet configuration hardened for Linux runners
  - CI `NuGet.config` clears `fallbackPackageFolders`
  - `NUGET_PACKAGES` set to a local cache under the workspace
- Artifacts
  - Backend: publish to `./publish`, upload as `dotnet-app`
  - Frontend: upload as `node-app`
- Azure deployment
  - `azure/login@v2` (OIDC) and `azure/webapps-deploy@v3`
  - Targets: `sherinetravels-api` and `sherinetravels-web` (Production slots)
- Caching and validations
  - Verify publish output before upload
  - Explicit restore/build ordering to ensure `project.assets.json` exists

### Branching Strategy with GitHub Actions

- Branches
  - `main`: protected; only fast-forward merges via approved PRs; deploys to Production via workflows
  - `dev`: integration branch; optional pre-prod builds or preview environments (if added later)
  - `feat/<feature-name>`: feature branches; open PRs into `dev` or `main`
- Pull Requests
  - Require passing CI checks (build succeeds) before merge
  - Recommended: at least one reviewer approval
- Triggers
  - CI/CD deploys run automatically on `push` to `main`
  - On-demand runs via "Run workflow" (workflow_dispatch)

### Operating the Pipelines

Manual run:
1. GitHub → Actions → select workflow → Run workflow
2. Ensure required secrets are configured
3. Confirm build job uploads artifact (`dotnet-app` or `node-app`) before deploy job starts

Rollback (basic):
- Re-run a previous successful workflow run (Re-run all jobs) or deploy a previous artifact if retained

### Troubleshooting

- Artifact not found
  - The deploy job downloads artifacts produced in the same run. Do not set `repository`/`run-id` unless intentionally fetching another run
  - Check that the build job completed and an artifact exists in the run summary
- `./publish` missing (backend)
  - Confirm publish targets `backend/Sherine.Api/Sherine.Api.csproj` and outputs to `./publish`
  - The workflow lists contents of `./publish` before upload for quick diagnosis
- NuGet fallback path error on Linux
  - The CI `NuGet.config` disables Windows-only fallback folders; restore and publish reference it explicitly
- `NETSDK1004: project.assets.json not found`
  - The workflow restores the API project explicitly before publish
- Next.js `useSearchParams must be wrapped in Suspense`
  - `frontend/web/app/oauth-bridge/page.tsx` wraps hook usage inside `<Suspense>`
- Frontend working directory errors
  - Workflow uses `working-directory: ./frontend/web` so `npm` runs in the correct folder

### Change Targets

If you rename Azure apps, slots, or artifact names/paths, update these in the workflows:

- Backend: `app-name`, `slot-name`, and `package: ./publish`
- Frontend: `app-name`, `slot-name`, and artifact name (`node-app`)


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
