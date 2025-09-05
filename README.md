

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
