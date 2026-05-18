# GTM Repository - Quick Reference Guide

## 🚀 Start Development in 2 Minutes

### Terminal 1: Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Update .env with Azure credentials
python app.py
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm start
```

Visit: `http://localhost:3000`

---

## 📁 Key Files

### Frontend
| File | Purpose |
|------|---------|
| `src/App.js` | Main component with state management |
| `src/components/Header.js` | Portal header banner |
| `src/components/FilterBar.js` | Tag filter buttons |
| `src/components/ResourceCard.js` | Individual resource card |
| `src/components/VideoModal.js` | Video player modal |
| `.env` | Frontend API URL configuration |

### Backend
| File | Purpose |
|------|---------|
| `app.py` | Flask application & API endpoints |
| `gtm_data.py` | Resource definitions (static data) |
| `blob_service.py` | Azure Blob Storage integration |
| `.env` | Backend configuration & Azure credentials |

---

## 🔧 Common Tasks

### Add New Resource
Edit `backend/gtm_data.py`:
```python
{
    'id': 7,
    'header': 'Resource Title',
    'description': 'Description',
    'tags': ['Tag1', 'Tag2'],
    'video_url': 'https://...'
}
```

### Change API URL
Edit `frontend/.env`:
```
REACT_APP_API_URL=http://new-url:5000
```

### Configure Azure Blob Storage
Edit `backend/.env`:
```
AZURE_STORAGE_CONNECTION_STRING=your_string
AZURE_STORAGE_CONTAINER_NAME=gtm-videos
```

### Update Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: "#1e40af",
  secondary: "#7c3aed"
}
```

---

## 🌐 API Endpoints Reference

```
GET  /api/resources        → Get all resources
GET  /api/resources/{id}   → Get specific resource
GET  /api/tags             → Get all tags
GET  /api/health           → Health check
```

---

## 📦 Project Structure

```
gtm-repo/
├── frontend/                # React app
│   ├── src/components/     # React components
│   ├── src/App.js          # Main component
│   ├── package.json        # Dependencies
│   └── .env                # Configuration
│
├── backend/                # Flask API
│   ├── app.py             # Flask app
│   ├── gtm_data.py        # Resources
│   ├── blob_service.py    # Azure integration
│   ├── requirements.txt   # Dependencies
│   └── .env               # Configuration
│
└── Docs/                   # Documentation
    ├── README.md
    ├── GETTING_STARTED.md
    ├── API_DOCUMENTATION.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

---

## 🎨 Frontend Features

- ✅ Responsive grid layout (1-3 columns)
- ✅ Tag-based filtering
- ✅ Video modal player
- ✅ Tailwind CSS styling
- ✅ Loading & error states
- ✅ Gradient headers

---

## 🔌 Backend Features

- ✅ RESTful API design
- ✅ CORS support
- ✅ Azure Blob Storage integration
- ✅ Environment configuration
- ✅ Error handling
- ✅ Health check endpoint

---

## 🧪 Testing

```bash
# Test Frontend
cd frontend && npm test

# Test Backend API
curl http://localhost:5000/api/health
curl http://localhost:5000/api/resources
curl http://localhost:5000/api/tags
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change `FLASK_PORT=5001` in `.env` |
| Port 3000 in use | `PORT=3001 npm start` |
| CORS error | Verify `REACT_APP_API_URL` matches backend |
| Video not loading | Check blob URL and permissions |
| Modules not found | Run `npm install` or `pip install -r requirements.txt` |

---

## 📊 Frontend Components Explanation

### Header
- Displays title and description
- Gradient background (primary → secondary)

### FilterBar
- Shows all available tags
- Toggle tags to filter resources
- Visual feedback (color change when selected)

### ResourceGrid
- Responsive grid layout
- Shows "no resources" message when empty
- Renders ResourceCard components

### ResourceCard
- Shows header, description, tags
- "Watch Demo" button
- Opens VideoModal on click

### VideoModal
- Full-screen video player
- Close button to dismiss
- Video controls included

---

## 🔐 Security Notes

- No authentication (open to all)
- Configure CORS for production
- Use HTTPS in production
- Never commit `.env` files
- Use SAS URLs for time-limited access
- Enable blob storage firewall rules

---

## 📈 Production Checklist

- [ ] Environment variables configured
- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured
- [ ] Azure credentials secured
- [ ] Frontend built & optimized
- [ ] Backend running with gunicorn
- [ ] Error logging configured
- [ ] Monitoring enabled

---

## 💡 Tips

1. **Frontend development**: Use React Developer Tools extension
2. **Backend debugging**: Enable `FLASK_ENV=development` and `APP_DEBUG=True`
3. **API testing**: Use Postman or curl
4. **Video preparation**: Use MP4 format for best browser compatibility
5. **Performance**: Use CDN for video delivery

---

## 📞 Quick Links

- [README](./README.md) - Project overview
- [Getting Started](./GETTING_STARTED.md) - Setup guide
- [API Documentation](./API_DOCUMENTATION.md) - API reference
- [Architecture](./ARCHITECTURE.md) - System design
- [Deployment](./DEPLOYMENT.md) - Production deployment

---

## 🎯 What's Included

✅ **Frontend (React)**
- Header component
- Filter bar with tag selection
- Resource grid with cards
- Video modal player
- Tailwind CSS styling
- Responsive design
- State management with hooks
- Error handling

✅ **Backend (Flask)**
- 4 API endpoints
- CORS configuration
- Azure Blob Storage integration
- Environment variable support
- Error handling
- Health check endpoint
- Static data definitions

✅ **Documentation**
- Complete README with features & setup
- Getting Started guide
- API documentation
- Architecture diagrams
- Deployment instructions
- This quick reference

✅ **Configuration**
- package.json for frontend
- requirements.txt for backend
- Environment templates
- Tailwind CSS config
- Git ignore files

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Ready to Deploy**: Yes ✅
