---
Task ID: 1
Agent: Main Agent
Task: Remove traffic light buttons, update sidebar branding, create owner account, shift Owner Portal to top, make it owner-only visible

Work Log:
- Updated app-shell.tsx sidebar footer: replaced "v27.0.0 · Professional · 18 Modules" with "v27.0.0 · Professional Edition" and added "© 2025 ApexFlow Ecosystem"
- Added Owner Access badge (amber/gold) in sidebar footer, visible only when authUser?.role === 'owner'
- Updated nav-config.ts: moved Owner Portal to new 'owner' group at the top, added ownerOnly flag
- Updated app-shell.tsx sidebar content: filters owner-only modules based on authUser role, hides empty groups
- Updated module-content.tsx: added AccessDenied component for owner-only modules when accessed by non-owners
- Created seed-auth.ts with owner account and serial key
- Created /api/auth/setup route for programmatic owner creation
- Ran db:seed-auth successfully
- Browser E2E verified: owner login shows Owner Portal at top with amber Owner Access badge
- Browser E2E verified: demo user cannot see Owner Portal or Owner group in sidebar

Stage Summary:
- Owner credentials: email=owner@bookflow.os, password=Owner@2025
- Serial key for device activation: BFOWN-2025-PROF-UNLM (Enterprise, unlimited devices, expires 2030)
- Owner Portal is now at the top of sidebar in its own "Owner" group
- Owner Portal is only visible to users with role='owner'
- Non-owner users see Access Denied if they try to navigate to /owner
- No traffic light buttons present (they were already removed in previous session)
