# GTM Repository Portal

A professional Go-to-Market (GTM) Resources repository portal with React frontend and Flask backend, featuring tag-based filtering and video demos from Azure Blob Storage.

## 📋 Project Overview

The GTM Repository is a centralized platform for accessing all go-to-market resources including:
- **Product Launch Strategies**
- **Market Analysis & Segmentation**
- **Sales Enablement Tools**
- **Digital Marketing Blueprints**
- **Competitive Intelligence**
- **Customer Success Frameworks**

### Key Features

✅ **Modern React Frontend** - Responsive UI with Tailwind CSS  
✅ **Python Flask Backend** - RESTful API with CORS support  
✅ **Azure Blob Storage Integration** - Video hosting and delivery  
✅ **Tag-Based Filtering** - Dynamic filtering by resource categories  
✅ **Video Player Modal** - Embedded video player for product demos  
✅ **Public Access** - Open to all users without authentication  

## 🏗️ Project Structure

```
gtm-repo/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js           # Main app component
│   │   └── index.js         # React entry point
│   ├── package.json         # NPM dependencies
│   └── tailwind.config.js   # Tailwind CSS config
│
├── backend/                  # Flask API
│   ├── app.py              # Main Flask app
│   ├── blob_service.py     # Azure Blob Storage integration
│   ├── gtm_data.py         # Resource definitions
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
│
├── docs/                    # Documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+)
- **Python** (v3.8+)
- **npm** or **yarn**
- **Azure Storage Account** (for blob storage)

### Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

Start development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

### Setup Backend

```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file (copy from `.env.example`):
```
FLASK_ENV=development
FLASK_PORT=5000
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=gtm-videos
```

Start Flask server:
```bash
python app.py
```

Backend API will run on `http://localhost:5000`

## 🔌 API Endpoints

### Resources
- **GET** `/api/resources` - Get all resources
- **GET** `/api/resources/<id>` - Get specific resource
- **GET** `/api/tags` - Get all unique tags
- **GET** `/api/health` - Health check

### Response Format

```json
{
  "id": 1,
  "header": "Product Launch Strategy",
  "description": "Comprehensive guide to launching...",
  "tags": ["Launch", "Strategy", "Product"],
  "video_url": "https://youraccount.blob.core.windows.net/gtm-videos/demo.mp4"
}
```

## 🎨 Frontend Components

- **Header** - Portal title and tagline
- **FilterBar** - Tag-based filtering with toggle buttons
- **ResourceGrid** - Grid layout for resources (responsive: 1-3 columns)
- **ResourceCard** - Individual resource card with video modal trigger
- **VideoModal** - Full-screen video player for demos

## 🌐 Azure Blob Storage Setup

1. **Create Storage Account**
   - Go to Azure Portal > Create Storage Account
   - Select appropriate region and replication options

2. **Create Container**
   - Navigate to Containers
   - Create new container named `gtm-videos`
   - Set access level to "Blob" for public access

3. **Upload Videos**
   - Upload your demo videos to the container
   - Get the blob URL: `https://<account>.blob.core.windows.net/gtm-videos/<filename>`

4. **Get Connection String**
   - Storage Account > Access Keys
   - Copy the connection string
   - Add to backend `.env` file

## 🔒 Security Considerations

- **No Authentication**: Portal is open to all (modify if needed)
- **CORS Enabled**: Configure allowed origins in Flask
- **SAS URLs**: Implement time-limited access for videos if required
- **Content Validation**: Validate all user inputs

## 📊 Customization

### Add New Resources

Edit `backend/gtm_data.py`:

```python
GTM_RESOURCES = [
    {
        'id': 7,
        'header': 'Your Resource Title',
        'description': 'Resource description',
        'tags': ['Tag1', 'Tag2'],
        'video_url': 'https://your-blob-url/video.mp4'
    }
]
```

### Update Styling

Modify `frontend/tailwind.config.js` for custom colors and themes.

### Configure Backend

Update environment variables in `.env`:

```
FLASK_ENV=development|production
FLASK_PORT=5000
CORS_ORIGINS=http://localhost:3000
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Health Check
```bash
curl http://localhost:5000/api/health
```

### API Testing
```bash
curl http://localhost:5000/api/resources
curl http://localhost:5000/api/tags
```

## 📦 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the build/ folder
```

### Backend (Heroku/Azure)
```bash
# Push to Heroku
git push heroku main

# Or deploy to Azure App Service
az webapp up --name gtm-repo-api
```

## 📝 Documentation

- [Frontend README](./frontend/README.md) - React app documentation
- [Backend README](./backend/README.md) - Flask API documentation

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

Internal EY Project - All rights reserved

## 📞 Support

For questions or issues, contact the GTM team.

---

**Last Updated**: May 2026  
**Version**: 1.0.0
