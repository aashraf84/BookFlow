# Task 3 - Code Agent: Fix Dashboard and Finance Modules

## Summary
Replaced all hardcoded/mock chart data in Dashboard and Finance modules with real database data from API endpoints.

## Changes Made

### `/api/dashboard/route.ts`
- Added trend calculations (today vs yesterday, this month vs last month)
- Added monthly revenue data (12 months from Sales aggregate)
- Added sales by category data (from SaleItems joined with BookCategory/StationeryCategory)
- Added branch performance data (Sales grouped by Branch)

### `/components/modules/dashboard.tsx`
- Removed hardcoded `monthlyRevenueData`, `salesByCategoryData`, `branchPerformanceData` arrays
- Extended `DashboardData` interface with trends and chart data fields
- Replaced hardcoded trend percentages with API-provided `calcTrend()` values
- Updated all chart components to use `data?.xxx ?? []` pattern

### `/api/finance/route.ts`
- Added new `type=charts` endpoint returning revenueExpenseData, cashFlowData, and trends
- Uses JournalEntryLine for double-entry accounting data
- Combines with Sale and Expense data for cash flow

### `/components/modules/finance.tsx`
- Added `ChartData` interface
- Added `chartData` state and `/api/finance?type=charts` fetch
- Removed `Math.random()` chart data generation
- Replaced hardcoded trend values with API-provided trends

## Verification
- `bun run lint` passes clean
- Pre-existing Neon PostgreSQL connection issue (unrelated to these changes)
