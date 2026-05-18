# GTM Repository Portal - Deployment Guide

## 🚀 Deployment Options

### Frontend Deployment

#### Option 1: Netlify (Recommended for Static Builds)

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=frontend/build
```

3. **Configure Environment**
- Set `REACT_APP_API_URL` in Netlify environment variables
- Point to your production backend URL

#### Option 2: Vercel

1. **Connect Repository**
- Push code to GitHub/GitLab
- Connect Vercel to your repository

2. **Configure Build Settings**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`

3. **Set Environment Variables**
```
REACT_APP_API_URL=https://your-api-domain.com
```

#### Option 3: Azure Static Web Apps

1. **Deploy via Azure CLI**
```bash
az staticwebapp create \
  --name gtm-repository \
  --resource-group your-rg \
  --source . \
  --location eastus \
  --branch main \
  --app-location "frontend" \
  --output-location "build"
```

2. **Configure API Backend URL**
- Update environment variable in Azure Portal

### Backend Deployment

#### Option 1: Heroku

1. **Prepare for Deployment**
```bash
cd backend

# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Add production requirements
pip install gunicorn
```

2. **Deploy**
```bash
# Initialize Heroku
heroku login
heroku create gtm-repo-api
heroku config:set FLASK_ENV=production
heroku config:set AZURE_STORAGE_CONNECTION_STRING=your_string
heroku config:set AZURE_STORAGE_CONTAINER_NAME=gtm-videos

# Deploy
git push heroku main
```

#### Option 2: Azure App Service

1. **Create App Service**
```bash
# Create resource group
az group create \
  --name gtm-resource-group \
  --location eastus

# Create App Service plan
az appservice plan create \
  --name gtm-plan \
  --resource-group gtm-resource-group \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group gtm-resource-group \
  --plan gtm-plan \
  --name gtm-repo-api \
  --runtime "PYTHON:3.11"
```

2. **Configure App Settings**
```bash
az webapp config appsettings set \
  --resource-group gtm-resource-group \
  --name gtm-repo-api \
  --settings \
    FLASK_ENV=production \
    AZURE_STORAGE_CONNECTION_STRING=your_string \
    AZURE_STORAGE_CONTAINER_NAME=gtm-videos
```

3. **Deploy Code**
```bash
# Via Git (Local Git Deployment)
az webapp deployment user set \
  --user-name username \
  --password password

# Push to Azure
git remote add azure https://username@gtm-repo-api.scm.azurewebsites.net/gtm-repo-api.git
git push azure main
```

#### Option 3: Docker Container

1. **Create Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

2. **Build and Push**
```bash
# Build image
docker build -t gtm-repo-api:latest .

# Tag for registry
docker tag gtm-repo-api:latest myregistry.azurecr.io/gtm-repo-api:latest

# Push to Azure Container Registry
docker push myregistry.azurecr.io/gtm-repo-api:latest

# Deploy to Azure Container Instances or App Service
```

## 🔐 Production Checklist

### Security
- [ ] Set `FLASK_ENV=production`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for specific origins only
- [ ] Use environment variables for secrets
- [ ] Never commit `.env` files
- [ ] Enable firewall rules

### Performance
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Set up caching headers
- [ ] Monitor API response times
- [ ] Load test the application

### Monitoring
- [ ] Set up error logging (Sentry, Application Insights)
- [ ] Monitor API availability
- [ ] Track user metrics
- [ ] Set up alerts for failures

### Scaling
- [ ] Configure auto-scaling if needed
- [ ] Use load balancer for multiple instances
- [ ] Database connection pooling (if using DB)
- [ ] Cache frequently accessed resources

## 🌐 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

### Backend (.env)
```
FLASK_ENV=production
FLASK_PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=gtm-videos
CORS_ORIGINS=https://your-frontend-domain.com
APP_DEBUG=False
```

## 📊 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run build
      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=frontend/build

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/gtm-repo-api.git main
```

## 🧪 Post-Deployment Testing

1. **Test Frontend**
   - Verify all pages load correctly
   - Test filtering functionality
   - Test video playback
   - Test responsive design

2. **Test Backend API**
   ```bash
   curl https://your-api-domain.com/api/health
   curl https://your-api-domain.com/api/resources
   curl https://your-api-domain.com/api/tags
   ```

3. **Performance Testing**
   - Load test with concurrent users
   - Monitor response times
   - Check error rates

## 📝 Rollback Procedure

### Heroku Rollback
```bash
heroku releases
heroku rollback v42  # Roll back to specific version
```

### Azure Rollback
- Use Azure Portal or CLI
- Restore from previous deployment slot
- Revert to previous release

## 🎯 Success Criteria

- ✅ Frontend loads without errors
- ✅ API endpoints respond correctly
- ✅ Videos play from blob storage
- ✅ Tag filtering works
- ✅ CORS properly configured
- ✅ Performance acceptable (< 2s page load)
- ✅ No error logs

---

**Deployment completed successfully! 🚀**
