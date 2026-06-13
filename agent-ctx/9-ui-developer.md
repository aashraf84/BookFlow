# Task 9 - UI Developer Agent

## Task
Rebuild Employees and Branches modules with macOS 27 Golden Gate design language

## Completed Work

### employees.tsx (macOS Contacts style)
- Two-column layout: left sidebar with department groups, right panel with contact list
- `macos-card`, `macos-stat`, `macos-shadow-card`, `macos-shadow-float` classes applied
- `macos-search` for search field, `macos-filter-bar` for status filters
- `macos-table-row` for contact list items
- Golden Gate palette: gg-bridge for header icon, gg-golden for payroll stat
- Department-colored avatars and badges (macos-blue, macos-purple, macos-green, etc.)
- View-only: `useAppStore` → `authUser?.isViewOnly` hides Add button and hover actions
- Named export `EmployeesModule`, 'use client'
- All existing data fetching, API calls, types preserved

### branches.tsx (macOS System Settings > Network style)
- Single card with Active/Offline sections like Network panel
- Building icon with status dot overlay (green=online, red=offline)
- SignalBars component: 4-bar strength indicator
- `macos-stat`, `macos-shadow-card`, `macos-shadow-float` classes applied
- Golden Gate palette: gg-bay for header/globe, gg-sunset for staff stat
- View-only: `useAppStore` → `authUser?.isViewOnly` hides Add Location and dropdowns
- Named export `BranchesModule`, 'use client'
- All existing data fetching, API calls, types preserved

## Verification
- ESLint passes clean
- Dev server compiles successfully
