# Task 4 - UI Developer: Rebuild Inventory Module

## Task
Rebuild `/home/z/my-project/src/components/modules/inventory.tsx` with macOS 27 Golden Gate design.

## What I Did
- Read the existing inventory.tsx (765 lines) to understand all data fetching, API calls, types, and state management
- Read globals.css to understand all available macOS 27 design utility classes
- Read app-store.ts for the `useAppStore` hook and `authUser?.isViewOnly` pattern
- Read dashboard.tsx for consistency reference on how other modules use the design system
- Completely rewrote inventory.tsx with the macOS 27 Golden Gate design language

## Key Changes
1. **Cards**: `macos-card` + `macos-shadow-card` on all card surfaces
2. **Stat Cards**: `macos-stat` class with size-9 rounded-xl colored icon containers, 24px/700 values
3. **Tables**: `macos-table-row` on all rows, 10px uppercase tracking-wider font-semibold headers
4. **Stock Level Bars**: 4-tier color-coded progress bars (green=healthy, yellow=moderate, orange=low, red=critical)
5. **Filter Bar**: `macos-filter-bar` with `macos-filter-item` / `macos-filter-item-active` for tab navigation
6. **Search**: `macos-search` class with clear button
7. **Badges**: rounded-md, bg-{color}/10 text-{color}, 10px/600 font
8. **Dialogs**: `macos-shadow-float` rounded-2xl
9. **Golden Gate Colors**: gg-bridge for primary actions, gg-bay for warehouse cards, gg-sunset for transfers, gg-golden for value stat
10. **View-only mode**: `useAppStore` → `authUser?.isViewOnly` hides Adjust/Restock/New Transfer buttons and Actions column
11. **Named export**: `InventoryModule` with `'use client'`
12. **Added search**: useMemo-filtered items by name/ISBN/SKU/warehouse/branch
13. **Helper functions**: Extracted `getProductName`, `getStockLevel`, `getStockLevelColors`, `getTransferStatusBadge` outside component

## Verification
- ESLint passes clean (no errors or warnings)
- Dev server compiles successfully (no errors in dev.log)
- All existing data fetching, API calls, and types preserved unchanged
