# Task 2 - Subagent (UI Developer): Rebuild Book Catalog and Authors modules

## Task
Rebuild TWO modules with the macOS 27 Golden Gate design language:
1. `/src/components/modules/book-catalog.tsx`
2. `/src/components/modules/authors.tsx`

## Work Completed

### book-catalog.tsx
- Complete rewrite with macOS 27 Golden Gate design
- Page header: Library icon (macos-blue/10), `macos-page-title` + subtitle, Add Book button (hidden for view-only)
- `macos-search` spotlight-style search with native input and clear button
- Filter dropdowns wrapped in `macos-filter-bar` containers
- Clear All button: `macos-filter-item macos-filter-item-active` with macos-red
- Books table: `macos-card macos-shadow-card`, `macos-table-row` rows, 10px uppercase tracking-wider headers
- Cover thumbnails: 8-color macOS Retina + Golden Gate palette with colored initials
- Category badges: `macos-badge` with 10-category color mapping
- Stock status: size-[6px] dot indicator
- Action buttons: Ghost with colored hover (blue edit, red delete)
- Dialog: `macos-shadow-float` rounded-2xl, macOS sticky header with icon, sectioned form (Basic Info, Classification, Publication, Pricing, Academic, Description)
- Form labels: 12px/500 text-muted-foreground with inline icons
- Inputs: rounded-lg, border-border/50, focus:ring-primary/20
- View-only: hides Add Book button and Actions column
- Default export, 'use client'

### authors.tsx
- Complete rewrite with macOS 27 Golden Gate design
- Page header: Users icon (gg-sunset/10), `macos-page-title` + subtitle, Add Author button (hidden for view-only)
- `macos-search` spotlight-style search with native input
- Author grid: `macos-card macos-shadow-card macos-card-hover`, group hover effect
- Avatar colors: 10-color palette (macOS Retina + Golden Gate), ring-offset on detail
- Detail view: Profile card with large avatar, contact links (mailto, website), book table with category badges
- Dialog: `macos-shadow-float` rounded-2xl, macOS header with PenTool icon (gg-sunset/10)
- View-only: hides Add Author button and edit/delete buttons
- Named export `AuthorsModule`, 'use client'

### module-content.tsx
- Updated import from `import AuthorsModule from` to `import { AuthorsModule } from` to match named export

## Results
- ESLint passes clean
- Dev server compiles successfully
- All existing data fetching logic, API calls, and type definitions preserved
- No new API routes added
