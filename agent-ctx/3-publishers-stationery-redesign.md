# Task 3: Rebuild Publishers & Stationery Modules with macOS 27 Golden Gate Design

## Summary
Rebuilt both Publishers and Stationery modules to match macOS 27 Golden Gate design language with native macOS System Settings list aesthetic.

## Files Modified

### 1. `/src/components/modules/publishers.tsx`
- Changed from `export default function PublishersModule` to `export function PublishersModule` (named export)
- Added `useAppStore` import for view-only mode detection
- Applied `macos-card` + `macos-shadow-card` on all card surfaces (publisher profile, books table, main table)
- Typography: `macos-page-title` (22px/700 -0.03em), `macos-page-subtitle` (13px muted), section headers 13px/600
- Search: `macos-search` class with native `<input>` for Spotlight feel
- Tables: `macos-table-row` on rows, 10px uppercase tracking-wider headers, border-border/50/30 separators
- Badges: `rounded-md text-[10px] font-semibold tracking-wider uppercase` with gg-sunset/macos-green colors
- Publisher icon colors: Added Golden Gate palette (gg-bridge, gg-bay, gg-sunset) to color rotation
- Detail view: size-16 rounded-2xl icon, gg-golden agreement text, BookOpen empty state icon
- Dialog: `macos-shadow-float rounded-2xl`, DialogDescription + DialogFooter, labels 12px/500, inputs `rounded-lg border-border/50`
- Loading: Skeleton with icon circle + line pattern
- View-only: Hides Add Publisher button and Actions column when `authUser?.isViewOnly`
- Replaced RefreshCw with Loader2 for delete spinner

### 2. `/src/components/modules/stationery.tsx`
- Named export `StationeryModule` preserved
- Added `useAppStore` import for view-only mode detection
- Added stat cards row: Total Products (macos-blue), In Stock (macos-green), Low Stock (macos-orange), Categories (gg-sunset)
- Stat cards: `macos-card macos-shadow-card` with size-9 rounded-xl icon containers, 22px/700 values, 11px labels
- Search: `macos-search` class with native `<input>` for Spotlight feel
- Filters: `macos-filter-bar` with `macos-filter-item` / `macos-filter-item-active` (replaced macos-segmented)
- Tables: `macos-table-row`, 10px uppercase tracking-wider headers, Product name+brand stacked, Package icon in macos-teal container
- Stock badges: rounded-md bg-{color}/10 text-{color} 10px/600 uppercase
- Price column: Stacked with discount % in macos-green below
- Dialog: `macos-shadow-float rounded-2xl`, DialogDescription + DialogFooter, labels 12px/500, inputs `rounded-lg border-border/50`
- Error alert: macos-card with macos-red/5 bg, icon in rounded container, dismiss button
- View-only: Hides Add Product button and Actions column when `authUser?.isViewOnly`

### 3. `/src/components/module-content.tsx`
- Updated PublishersModule import from default to named: `import { PublishersModule } from '@/components/modules/publishers'`

## Design System Compliance
- ✅ Cards: `macos-card` (rounded-xl, 0.5px border, subtle shadow)
- ✅ Shadows: `macos-shadow-card` for cards, `macos-shadow-float` for dialogs
- ✅ Typography: 22px/700 -0.03em title, 13px/600 sections, 13px/500 body, 11px muted, 10px uppercase labels
- ✅ macOS Retina Colors: macos-blue, macos-green, macos-purple, macos-orange, macos-red, macos-teal
- ✅ Golden Gate Palette: gg-bridge, gg-sunset, gg-golden, gg-bay
- ✅ Tables: macos-table-row, 10px uppercase tracking-wider headers, 13px cells
- ✅ Badges: rounded-md, bg-{color}/10 text-{color}, 10px/600
- ✅ Buttons: shadcn Button rounded-lg
- ✅ Search: macos-search class
- ✅ Filters: macos-filter-bar with macos-filter-item/macos-filter-item-active
- ✅ Dialogs: shadcn Dialog with macos-shadow-float, rounded-2xl
- ✅ Forms: Label 12px/500, Input rounded-lg border-border/50
- ✅ Empty states: Center-aligned with icon, title, description
- ✅ Loading: Skeleton in card layouts
- ✅ View-only: useAppStore authUser?.isViewOnly check
- ✅ Named exports: PublishersModule, StationeryModule
- ✅ 'use client' directive
- ✅ Existing data fetching, API calls, types preserved

## Lint & Build
- ESLint passes clean
- Dev server compiles successfully
