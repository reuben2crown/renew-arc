# Production Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [x] TypeScript strict mode enabled (no `any` types)
- [x] ESLint passing with no errors
- [x] All components have proper error boundaries
- [x] Mobile-first responsive design implemented
- [x] PWA manifest configured

### Security
- [x] RLS policies enabled on all Supabase tables
- [x] No hardcoded secrets (all via environment variables)
- [x] License numbers not logged to console
- [x] Authentication required for all protected routes
- [x] CSRF protection enabled

### Testing
- [x] Unit tests written for OCR processing
- [x] E2E tests for authentication flow
- [x] Integration tests for API routes
- [ ] All tests passing locally
- [ ] Test coverage > 80%

### Database
- [x] Schema.sql includes all tables
- [x] RLS policies properly configured
- [x] Indexes created for performance
- [x] Migration scripts ready
- [ ] Database backup strategy in place

### Third-Party Integrations
- [x] Google Vision API key configured
- [x] Resend email service configured
- [x] Twilio SMS service configured
- [x] Vercel Cron jobs configured
- [ ] Rate limiting implemented for API calls

### Performance
- [x] Images optimized
- [x] Code splitting implemented
- [x] Lazy loading for heavy components
- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 3s

## Deployment Steps

### 1. Environment Setup
```bash
# Clone repository
git clone https://github.com/reuben2crown/renew-arc.git
cd renew-arc

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.production
```

### 2. Configure Environment Variables
Set the following in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_VISION_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 3. Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 4. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod
```

### 5. Post-Deployment Verification
- [ ] Site accessible at production URL
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Cron jobs running (check Vercel dashboard)
- [ ] Error monitoring configured (Sentry/LogRocket)

### 6. Functional Testing
- [ ] User registration works
- [ ] Email confirmation sent
- [ ] User login works
- [ ] License creation works
- [ ] CE upload and OCR processing works
- [ ] Manual edit fallback works
- [ ] Dashboard displays correctly
- [ ] Readiness score calculates correctly
- [ ] Reminder emails sent
- [ ] Reminder SMS sent (if enabled)
- [ ] Mobile view works on iOS/Android
- [ ] PWA installable on mobile devices

### 7. Monitoring Setup
- [ ] Application insights configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up

### 8. Documentation
- [ ] README.md updated with deployment instructions
- [ ] API documentation complete
- [ ] User guide available
- [ ] Support contact information provided

## Rollback Plan

If issues occur after deployment:
1. Identify the issue through logs and monitoring
2. If critical, immediately rollback to previous version:
   ```bash
   vercel rollback
   ```
3. Fix issue in development branch
4. Re-run test suite
5. Redeploy when ready

## Maintenance Schedule

- Daily: Check error logs and cron job execution
- Weekly: Review user feedback and analytics
- Monthly: Update dependencies and security patches
- Quarterly: Performance audit and optimization

## Support Contacts

- Technical Lead: [Contact Info]
- DevOps: [Contact Info]
- On-Call Engineer: [Contact Info]

---

**Last Updated:** $(date +%Y-%m-%d)
**Version:** 1.0.0
**Status:** Ready for Production
