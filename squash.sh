#!/bin/bash
set -e

# Write the rebase todo using fixup (no editor opens for squashed commits)
cat > /tmp/rebase-todo.txt << 'EOF'
pick 2a9a4ea Initial commit
fixup d3b159c Initial project setup
pick d4f007e generate prisma schema for milestone
fixup f107b9d use modular prisma schema folder architecture
pick f140dcd Add core server utilities and configuration
pick 7a193f4 Implement authentication module with register login and me endpoints
pick 5159312 Setup main API router and link authentication module
fixup 16fc1e8 Integrate routes and error handlers into main Express application
pick 80455d0 Add UserStatus enum to Prisma schema for admin ban feature
pick 15421b6 Add Zod validation schemas for User profile and status updates
fixup 7d45590 Implement user service logic for profile and admin status updates
fixup 90f9e3c Add user controller for handling profile and admin requests
fixup 2763cb3 Refactor user and admin routes into separate modules for clarity
pick 42f62f6 Add Zod validation for category creation and updates
fixup d4fce0c Implement category service and controller logic
fixup 01c7ffb Set up category endpoints and add to main router
pick 022afc2 Add Zod validation for property creation and updates
fixup d3eb4d0 Implement property service logic with filtering and pagination
fixup 675efb5 Fix all TypeScript errors across validation middleware and controllers
fixup 73d5dc2 Wire up property routes for public browsing and landlord management
pick e0accff Build complete rental request module with tenant and landlord flows
pick 9b97f97 Add Zod validation schemas for payment creation and confirmation
fixup d188cbc Implement payment module for tenant payment initiation and confirmation
pick a505dc4 Add review module with post-payment guard and property review listing
pick f28b2c2 Extend admin routes with property and rental request oversight
pick 48fa07d Update env example with all required variables
pick 6f822f6 Improve error handler to return structured Zod validation errors
pick 329dbd5 Write project README with setup instructions and endpoint reference
pick f3bc6e1 Fix tsconfig ignoreDeprecations and implement Stripe webhook in app.ts
fixup 75332e9 Refactor routing to mount all modules directly in app.ts
fixup 81d8161 Revert refactor routing change
pick bc4d3fa Align rental state machine strictly with assignment flow diagram
fixup 8de56ed Extract landlord management routes to exactly match requested endpoints
pick f14be0c Move prisma instance to lib directory and add shared stripe instance
fixup 253ce61 Extract JWT generation and verification logic to centralized jwtUtils
pick 33a3b54 Implement real Stripe PaymentIntent creation and wire webhook to service handler
fixup 3cb917b Implement Stripe Checkout session integration and cookie-based authentication
pick 098416c Remove all unnecessary comments and stale code across all modules
fixup c5a60f3 Update README with accurate endpoints and clean structure
pick ecb3b22 Add npm scripts and run migration for ACTIVE and COMPLETED rental status
fixup b5951c8 Use npx prefix in all scripts for consistency
fixup 91b40d9 add stripe:webhook script for local development endpoint listening
fixup 8a0a255 Fix main entry point and add migrate:deploy script for production
pick 586321a Rename error response field to errorDetails as per assignment spec
fixup b246c94 Add database seed script for default admin credentials
fixup 57c6b5e Fix 404 handler to strictly match the error format
fixup 579ff2a Update .gitignore with standard Node environment and OS exclusions
pick ab95eb5 Fix TypeScript build error by explicitly setting rootDir
fixup 7841a06 Restore type module and update start script to use tsx for runtime ESM support
pick 8bb800f Mark property as unavailable when rental becomes active
fixup 6493770 Rename payment success redirect route to confirm
fixup 7e7df48 restrict user roles by removing ADMIN assignment and filtering admin users from lists
fixup df5f187 update project name to rentnest-backend in package.json
EOF

FILTER_BRANCH_SQUELCH_WARNING=1 \
GIT_SEQUENCE_EDITOR="cp /tmp/rebase-todo.txt" \
git rebase -i --root

echo "Done! Commit count: $(git rev-list --count HEAD)"
