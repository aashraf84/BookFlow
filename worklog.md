---
Task ID: 1
Agent: Main Agent
Task: Migrate BookFlow OS from SQLite to Neon PostgreSQL with multi-tenant setup + redesign login screen

Work Log:
- Changed Prisma provider from `sqlite` to `postgresql` with Neon connection strings
- Added `Tenant` model with company info, plan, status, and all tenant-scoped relations
- Added `tenantId` field to all tenant-scoped models (User, Branch, Employee, Book, etc.)
- Changed global `@unique` constraints to composite `@@unique([tenantId, field])` where appropriate
- Owner/SaaS management models (OwnerClient, OwnerSubscription, etc.) remain global (no tenantId)
- Updated `.env` with Neon PostgreSQL connection strings (pooled + direct)
- Updated `db.ts` with Neon serverless WebSocket support and multi-tenant seed data
- Updated `app-store.ts` to include `tenantId` in `AuthUser` interface
- Updated all auth API routes (login, demo, verify, activate) to return `tenantId`
- Redesigned `login-gate.tsx` with macOS-style box-shaped login card
- Pushed schema to Neon PostgreSQL successfully (all tables created)
- Auto-seed verified: Tenant (ApexFlow HQ) + Owner + Demo User + 5 Serial Keys
- All 3 auth flows verified via curl: Activate, Login, Demo Login
- Lint passes clean

Stage Summary:
- Database: Migrated from SQLite to Neon PostgreSQL with full multi-tenant architecture
- Tenant model: ApexFlow HQ (enterprise plan) as default tenant
- Users: admin@apexflow.cloud (owner) + demo@bookflow.os (demo), both linked to tenant
- Serial Keys: BFOWN-2025-PROF-UNLM + 4 others
- Login screen: macOS-style frosted glass box with avatar, inputs, and buttons
- AuthUser interface now includes tenantId for tenant-aware queries
- Browser verification limited by sandbox memory constraints, but all API endpoints verified working
