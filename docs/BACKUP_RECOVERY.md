# Backup & Recovery Procedures

**Last Updated:** February 2, 2026  
**Document Owner:** Scholarship Committee IT  
**Review Cycle:** Quarterly

## Critical Systems

| System | Provider | RPO | RTO |
|--------|----------|-----|-----|
| Database | Convex | 1 hour | 4 hours |
| File Storage | Convex | 1 hour | 4 hours |
| Application | Vercel | N/A (stateless) | 1 hour |
| Email | Resend | N/A | N/A |

---

## 1. Overview

This document outlines the backup and disaster recovery procedures for the Stark Scholars Platform. It covers data protection strategies, recovery workflows, and emergency response protocols to ensure business continuity in the event of system failures, data corruption, or other disasters.

**Key Objectives:**
- Minimize data loss (RPO: 1 hour)
- Minimize downtime (RTO: 4 hours)
- Ensure data integrity and confidentiality
- Provide clear recovery procedures for the team

---

## 2. Backup Procedures

### 2.1 Convex Database Backups

#### Automated Backups

Convex provides automatic point-in-time recovery:
- **Retention:** 7 days for daily snapshots
- **Point-in-time:** Any point in the last 7 days
- **Recovery method:** Contact Convex support or use dashboard

#### Manual Export Procedure

**Weekly Export (Recommended before selection):**

```bash
# 1. Export all data using Convex CLI
npx convex export --format json --path ./backups/weekly-export-$(date +%Y%m%d)

# 2. Verify export integrity
ls -la ./backups/weekly-export-*/

# 3. Compress and encrypt
tar -czf ./backups/weekly-export-$(date +%Y%m%d).tar.gz ./backups/weekly-export-*/
gpg --symmetric --cipher-algo AES256 ./backups/weekly-export-$(date +%Y%m%d).tar.gz

# 4. Secure storage
# - Upload to secure cloud storage (Google Drive, Dropbox)
# - Keep local copy in encrypted USB
# - Share location with backup contact
```

**Critical Pre-Selection Export (April 10, 2026):**
```bash
# Export everything before committee selection begins
npx convex export --format json --path ./backups/pre-selection-$(date +%Y%m%d-%H%M%S)

# Include file metadata
npx convex export --include-storage --path ./backups/pre-selection-full-$(date +%Y%m%d-%H%M%S)
```

### 2.2 File Storage Backups

#### Document Export

Academic documents (transcripts, essays, recommendations) stored in Convex Storage:

```bash
# Export all files
npx convex export --include-storage --path ./backups/files-$(date +%Y%m%d)
```

#### File Integrity Check

```bash
# Verify all files are readable
for file in ./backups/files-*/_storage/*; do
  if ! file "$file" > /dev/null; then
    echo "Corrupt file: $file"
  fi
done
```

### 2.3 Code & Configuration Backup

#### Git Repository

**Primary:** GitHub repository  
**Backup:** Local bare repository

```bash
# Create local backup mirror
git clone --mirror git@github.com:yourorg/starkscholars.git ./backups/repo-backup
cd ./backups/repo-backup
git remote update

# Backup to external drive monthly
cp -r ./backups/repo-backup /mnt/external-drive/
```

#### Environment Variables

```bash
# Export environment variables (DO NOT COMMIT)
cp .env.local ./backups/env-backup-$(date +%Y%m%d).txt

# Encrypt sensitive values
gpg --symmetric --cipher-algo AES256 ./backups/env-backup-$(date +%Y%m%d).txt

# Store in password manager and secure location
```

---

## 3. Recovery Procedures

### 3.1 Database Recovery

#### Scenario 1: Accidental Data Deletion

**Symptoms:** Applications or user data missing  
**Recovery Time:** 1-4 hours

**Steps:**
1. **STOP ALL WRITE OPERATIONS**
   - Enable maintenance mode in Vercel
   - Display "Under Maintenance" page

2. **Identify Recovery Point**
   - Determine when data was last known good
   - Check audit logs for deletion timestamp

3. **Contact Convex Support**
   ```
   Email: support@convex.dev
   Subject: URGENT - Point-in-time recovery needed
   
   Account: [Your Convex account]
   Deployment: dev:elegant-kangaroo-956
   Recovery Point: [ISO timestamp]
   Reason: Accidental data deletion
   ```

4. **Alternative: Restore from Export**
   ```bash
   # If recent export exists
   npx convex import --path ./backups/weekly-export-YYYYMMDD/data.json
   ```

5. **Verify Data Integrity**
   - Check record counts match expected
   - Verify relationships (applications ↔ users)
   - Test critical functionality

6. **Resume Operations**
   - Disable maintenance mode
   - Notify users of recovery

#### Scenario 2: Complete Database Loss

**Symptoms:** All data inaccessible, Convex deployment corrupted  
**Recovery Time:** 4-8 hours

**Steps:**
1. Create new Convex deployment
2. Run schema migration: `npx convex dev`
3. Import latest backup: `npx convex import`
4. Update environment variables with new deployment URL
5. Redeploy application: `vercel --prod`
6. Verify all integrations (Resend, Better Auth)
7. Notify users of temporary outage

### 3.2 Application Recovery

#### Scenario: Vercel Deployment Failure

**Symptoms:** Application not loading, 500 errors  
**Recovery Time:** 30 minutes - 1 hour

**Steps:**
1. **Check Status Pages**
   - Vercel Status: https://www.vercel-status.com/
   - Convex Status: https://status.convex.dev/

2. **Rollback to Previous Deployment**
   ```bash
   # Via Vercel CLI
   vercel --version
   vercel rollback [deployment-url]
   
   # Or via Dashboard
   # 1. Go to Vercel Dashboard → Project
   # 2. Click "Deployments"
   # 3. Find last known good deployment
   # 4. Click "..." → "Promote to Production"
   ```

3. **If Rollback Fails - Redeploy**
   ```bash
   # From clean repository
   git clone [repo-url] fresh-deploy
   cd fresh-deploy
   
   # Install dependencies
   npm ci
   
   # Verify environment variables
   cp .env.local.example .env.local
   # [Fill in all required variables]
   
   # Deploy
   vercel --prod
   ```

### 3.3 Email Service Recovery

#### Scenario: Resend Outage

**Symptoms:** Emails not sending, user complaints  
**Recovery Time:** Immediate (failover)

**Steps:**
1. Check Resend status: https://resend.statuspage.io/
2. If outage confirmed, implement email queue:
   - Store emails in database temporarily
   - Retry sending when service resumes
   - Display in-app notifications as backup

3. **Manual Email Procedure (Critical only)**
   - Export pending emails from database
   - Send via alternative method (Gmail, Mailgun)
   - Mark as sent in database

---

## 4. Emergency Contacts

| Service | Contact | Purpose |
|---------|---------|---------|
| Convex Support | support@convex.dev | Database recovery |
| Vercel Support | support@vercel.com | Hosting issues |
| Resend Support | support@resend.com | Email issues |
| Scholarship Chair | [email] | Decision authority |
| IT Backup | [email] | Technical recovery |

---

## 5. Maintenance Windows

### Scheduled Maintenance

**Pre-Deadline (March 15):**
- Full system backup
- Performance optimization
- Security review

**Post-Deadline (April 16):**
- Export all applications
- Begin evaluation lockdown
- Disable new registrations

**Pre-Selection (May 1):**
- Final backup before announcement
- Verify recipient data
- Prepare notification templates

---

## 6. Testing Recovery Procedures

### Quarterly Recovery Drill

**Objective:** Verify backup integrity and team readiness

**Checklist:**
- [ ] Export database to test environment
- [ ] Verify all records export correctly
- [ ] Test restore procedure on staging
- [ ] Verify file attachments accessible
- [ ] Confirm team has access to backups
- [ ] Update this document with any issues

**Next Drill Date:** [Set date]

---

## 7. Security Considerations

### Backup Security

1. **Encryption:** All backups encrypted with AES256
2. **Access Control:** Limit backup access to 2 people
3. **Storage:** Use secure cloud + offline USB
4. **Rotation:** Delete backups older than 1 year
5. **Audit:** Log all backup access

### Environment Variables

**NEVER commit to Git:**
- RESEND_API_KEY
- GROQ_API_KEY
- BETTER_AUTH_SECRET
- Convex deployment keys

**Secure in:**
- Password manager (1Password, Bitwarden)
- Vercel environment variables
- Encrypted local backup

---

## 8. Quick Reference

### Emergency Commands

```bash
# Immediate backup
npx convex export --path ./emergency-backup-$(date +%Y%m%d-%H%M%S)

# Enable maintenance mode
# (Set environment variable in Vercel)
MAINTENANCE_MODE=true

# Disable maintenance mode
MAINTENANCE_MODE=false

# Check database status
npx convex status

# View recent logs
npx convex logs
```

### Critical File Locations

| File | Location | Purpose |
|------|----------|---------|
| Schema | `convex/schema.ts` | Database structure |
| Auth Config | `lib/auth.ts` | Better Auth setup |
| Env Vars | `.env.local` | Secrets (encrypted backup) |
| Backups | `./backups/` | Local backup directory |

---

## Appendix A: Pre-Launch Checklist

Before April 15, 2026:
- [ ] Full database backup created
- [ ] All environment variables backed up
- [ ] Team trained on recovery procedures
- [ ] Emergency contacts confirmed
- [ ] Maintenance window scheduled
- [ ] Rollback plan tested

## Appendix B: Post-Selection Checklist

After recipient selection:
- [ ] Final application export archived
- [ ] Recipient data backed up separately
- [ ] System prepared for next cycle
- [ ] Analytics data exported
