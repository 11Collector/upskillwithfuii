Run a pre-deployment check before pushing to Vercel.

Steps:
1. Run TypeScript check: `npx tsc --noEmit` from the project root. Report any errors with file path and line number.
2. Check that these required environment variables are present in `.env.local`:
   - DEEPSEEK_API_KEY
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - STRIPE_SECRET_KEY
   - NEXT_PUBLIC_BASE_URL
   - FIREBASE_CLIENT_EMAIL
   - FIREBASE_PRIVATE_KEY
3. Warn about optional but recommended vars: NEXT_PUBLIC_ADMIN_EMAILS, STRIPE_REPORT_PRICE_ID, STRIPE_MONTHLY_PRICE_ID
4. Report a clear summary:
   - ✅ TypeScript: passed / ❌ TypeScript: N errors found
   - ✅ Env vars: all present / ⚠️ Missing: [list]
5. If everything passes, confirm "พร้อม deploy ได้เลย"
