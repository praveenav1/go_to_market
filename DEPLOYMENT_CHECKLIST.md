# Deployment Checklist - "Add my GTM" Feature

## Pre-Deployment Requirements

### Backend Setup
- [ ] Ensure Python 3.8+ is installed
- [ ] Install all dependencies: `pip install -r requirements.txt`
- [ ] Verify Azure Blob Storage credentials are configured
- [ ] Test connection to Azure Blob Storage
- [ ] Create `.env` file with all required variables:
  - [ ] `AZURE_STORAGE_CONNECTION_STRING`
  - [ ] `AZURE_STORAGE_CONTAINER_NAME`
  - [ ] `AZURE_BLOB_CONTAINER_URL`
  - [ ] `AZURE_BLOB_SAS_TOKEN`
  - [ ] `FLASK_ENV` (set to 'production')
  - [ ] `FLASK_PORT` (default: 5000)

### Frontend Setup
- [ ] Ensure Node.js 14+ is installed
- [ ] Install dependencies: `npm install` in frontend folder
- [ ] Verify `REACT_APP_API_URL` is set correctly
- [ ] Test build: `npm run build`

### File System
- [ ] Ensure backend directory has write permissions
- [ ] Temp upload folder will auto-create at `backend/temp_uploads/`
- [ ] Verify submissions.json can be created in backend folder

---

## Deployment Steps

### Step 1: Backend Deployment
```bash
cd backend
pip install -r requirements.txt
# Verify all imports work
python -c "from submissions import SubmissionsManager; print('✓ Submissions module OK')"
python -c "from blob_service import BlobStorageService; print('✓ Blob service OK')"
```

### Step 2: Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Verify build completed successfully
ls -la build/  # or dir build\ on Windows
```

### Step 3: Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all Azure credentials
- [ ] Set `FLASK_ENV=production`
- [ ] Verify API URL is accessible

### Step 4: Testing
- [ ] Start backend: `python backend/app.py`
- [ ] Start frontend: `npm start` (in frontend folder)
- [ ] Test user submission flow
- [ ] Test admin approval flow
- [ ] Verify video uploads to Azure Blob
- [ ] Verify approved resource appears in repository

### Step 5: Production Deployment
- [ ] Deploy backend to production server
- [ ] Deploy frontend build files to web server
- [ ] Update DNS/load balancer if needed
- [ ] Run smoke tests on production

---

## Post-Deployment Verification

### Functional Tests
- [ ] User can navigate to "Add my GTM" page
- [ ] Form validation works (try submitting empty form)
- [ ] Video upload works (test with small video file)
- [ ] Submission appears in admin queue
- [ ] Admin panel accessible (press 'A' key)
- [ ] Can filter submissions by status
- [ ] Can approve submission (verify resource appears)
- [ ] Can reject submission (verify resource doesn't appear)
- [ ] Tags work correctly (search by tag)
- [ ] Video plays in modal

### Security Checks
- [ ] File upload type validation works
- [ ] File size limit enforced (500MB max)
- [ ] CORS headers are correct
- [ ] No sensitive data in logs
- [ ] Azure credentials not hardcoded

### Performance Tests
- [ ] Page load time acceptable (< 3 seconds)
- [ ] Video upload progress visible
- [ ] Admin panel loads smoothly
- [ ] No database/API errors in logs

---

## Monitoring

### Logs to Monitor
- Backend logs at: `backend/` directory
- Look for: submission errors, upload failures, admin actions
- Set up log aggregation if using production servers

### Key Metrics
- Number of pending submissions
- Approval rate
- Video upload success rate
- API response times
- Server error rate

---

## Rollback Plan

If issues arise, rollback steps:

1. **Stop the service**
   ```bash
   # Stop Flask backend
   # Stop serving frontend
   ```

2. **Restore previous version**
   - Restore old `app.py` from git
   - Restore old frontend build

3. **Clear submission data if needed**
   - Delete `backend/submissions.json` to clear queue
   - Or restore from backup

4. **Verify**
   - Restart services
   - Test core functionality

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor for any errors or crashes
- [ ] Collect user feedback
- [ ] Check video upload quality
- [ ] Monitor admin approval times

### Week 2
- [ ] Review all submissions (approved/rejected)
- [ ] Check for any policy violations
- [ ] Gather statistics on usage
- [ ] Plan any improvements

### Ongoing
- [ ] Monitor disk space (temp uploads folder)
- [ ] Check Azure Blob Storage costs
- [ ] Plan for database migration if needed
- [ ] Implement proper authentication

---

## Troubleshooting Guide

### Issue: "No module named 'submissions'"
**Solution**: Verify submissions.py exists in backend folder
```bash
ls -la backend/submissions.py  # Check if file exists
```

### Issue: "Failed to upload video"
**Solution**: Check Azure credentials
```bash
python -c "from blob_service import BlobStorageService; b = BlobStorageService(); print('Client:', b.client is not None)"
```

### Issue: Admin panel not showing
**Solution**: Press 'A' key multiple times, refresh page

### Issue: Video not playing after approval
**Solution**: Verify Azure Blob URL is accessible
- Check SAS token validity
- Verify CORS settings on blob container

### Issue: Submissions.json not created
**Solution**: Check backend folder permissions
```bash
touch backend/submissions.json  # Try creating manually
chmod 666 backend/submissions.json  # Set permissions
```

---

## Success Criteria

Feature is successfully deployed when:
- ✅ Users can submit GTM resources
- ✅ Admins can approve/reject submissions
- ✅ Approved resources appear in repository
- ✅ Videos upload and play correctly
- ✅ No major errors in logs
- ✅ Page load times are acceptable
- ✅ All required documentation is available

---

## Support Contacts

- **Backend Issues**: Check app.py logs
- **Frontend Issues**: Check browser console (F12)
- **Azure Issues**: Check connection string and credentials
- **File Upload Issues**: Check temp_uploads folder permissions

---

## Version Info

- **Feature Version**: 1.0
- **Deployment Date**: [To be filled]
- **Deployed By**: [To be filled]
- **Status**: Ready for deployment

---

*Last Updated: May 26, 2026*
