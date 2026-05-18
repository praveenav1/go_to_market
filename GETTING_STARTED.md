# GTM Repository Portal - Getting Started Guide

## 📋 Prerequisites

Before you start, make sure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **Git** for version control
- **Azure Storage Account** for blob storage (optional, for video hosting)

## ⚡ Quick Setup (Windows)

### 1. Clone/Open the Repository
```bash
cd gtm-repo
```

### 2. Install All Dependencies
```bash
npm run setup
```

### 3. Configure Backend

Navigate to `backend/` directory:
```bash
cd backend
```

Create a `.env` file from the template:
```bash
copy .env.example .env
```

Edit `.env` with your settings:
```
FLASK_ENV=development
FLASK_PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string_here
AZURE_STORAGE_CONTAINER_NAME=gtm-videos
```

### 4. Configure Frontend

Navigate to `frontend/` directory:
```bash
cd frontend
```

Create a `.env` file:
```bash
echo REACT_APP_API_URL=http://localhost:5000 > .env
```

### 5. Start Development Servers

**Option A: Start Both (requires concurrently)**
```bash
npm run dev
```

**Option B: Start Separately**

Terminal 1 - Backend:
```bash
cd backend
python app.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### 6. Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

## 🎯 Features Overview

### Frontend (React + Tailwind CSS)
- Browse GTM resources with header, description, and tags
- Filter resources by tags
- Watch demo videos in modal player
- Responsive design for all devices

### Backend (Flask + Python)
- RESTful API for resource management
- Tag extraction and filtering
- Azure Blob Storage integration for videos
- CORS support for frontend communication

### Data Structure
Each resource includes:
- **Header** - Resource title
- **Description** - Detailed information
- **Tags** - Categories for filtering
- **Video URL** - Demo video from blob storage

## 📁 Project Structure

```
gtm-repo/
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   ├── App.js           # Main component
│   │   └── index.js         # Entry point
│   ├── public/              # Static files
│   └── package.json         # Frontend dependencies
│
├── backend/
│   ├── app.py              # Flask application
│   ├── gtm_data.py         # Resource definitions
│   ├── blob_service.py     # Azure integration
│   └── requirements.txt    # Backend dependencies
│
└── README.md               # Project documentation
```

## 🔧 Configuration Files

### Frontend Files
- `.env` - Environment variables (API URL)
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind CSS customization
- `public/index.html` - HTML template

### Backend Files
- `.env` - Environment variables (Azure credentials)
- `.env.example` - Template with all available options
- `requirements.txt` - Python package dependencies
- `app.py` - Main Flask application

## 🚀 Common Commands

### Frontend Commands
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Backend Commands
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py

# Test API endpoint
curl http://localhost:5000/api/health
```

## 🎨 Customization

### Add New Resources
Edit `backend/gtm_data.py` and add to `GTM_RESOURCES` list:

```python
{
    'id': 7,
    'header': 'New Resource',
    'description': 'Description here',
    'tags': ['Tag1', 'Tag2'],
    'video_url': 'https://your-blob-url/video.mp4'
}
```

### Change Colors
Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: "#your-color",
      secondary: "#your-color"
    }
  }
}
```

### Update API URL
Edit `frontend/.env`:
```
REACT_APP_API_URL=http://your-api-url:port
```

## 🌐 Azure Blob Storage Setup

1. Create Azure Storage Account
2. Create container named `gtm-videos`
3. Upload MP4 videos to container
4. Get connection string from Access Keys
5. Update backend `.env` with connection string
6. Update video URLs in `gtm_data.py`

## 🧪 Testing

### Test Frontend
```bash
cd frontend
npm test
```

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Get all resources
curl http://localhost:5000/api/resources

# Get all tags
curl http://localhost:5000/api/tags
```

## 📊 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
FLASK_PORT=5001  # Backend
# Or for frontend
PORT=3001 npm start
```

### CORS Errors
Ensure `REACT_APP_API_URL` matches your backend URL in frontend `.env`

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install --upgrade -r requirements.txt
```

### Video Not Loading
- Verify blob URL is correct in `gtm_data.py`
- Check Azure container permissions are set to "Blob"
- Verify blob storage connection string in backend `.env`

## 📞 Support

For issues or questions:
1. Check the main README.md
2. Review individual component READMEs
3. Contact the GTM team

## 🎉 Next Steps

1. ✅ Set up the development environment
2. ✅ Start both frontend and backend servers
3. ✅ Open http://localhost:3000 in browser
4. ✅ Test filtering and video playback
5. ✅ Customize resources and styling
6. ✅ Deploy to production

Happy coding! 🚀
