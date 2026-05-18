# GTM Repository Portal - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React Frontend (Port 3000)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  - Header Component         - FilterBar Component        │  │
│  │  - ResourceGrid Component   - ResourceCard Component     │  │
│  │  - VideoModal Component     - State Management           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTP/CORS
                      (REST API Calls)
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Flask Backend API (Port 5000)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  GET /api/resources      - Get all resources             │  │
│  │  GET /api/resources/{id} - Get single resource           │  │
│  │  GET /api/tags           - Get all tags                  │  │
│  │  GET /api/health         - Health check                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Data Layer                                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  - gtm_data.py: Static resource definitions              │  │
│  │  - blob_service.py: Azure Blob Storage integration       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
                  (Video Streaming URLs)
┌─────────────────────────────────────────────────────────────────┐
│                   AZURE BLOB STORAGE                             │
├─────────────────────────────────────────────────────────────────┤
│  Container: gtm-videos                                           │
│  ├── product-launch-demo.mp4                                     │
│  ├── market-analysis-demo.mp4                                    │
│  ├── sales-enablement-demo.mp4                                   │
│  └── ... (other video files)                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Resource Fetching Flow

```
User Opens App
    ↓
React App Loads (App.js)
    ↓
useEffect: fetchResources()
    ↓
Axios GET /api/resources
    ↓
Flask Backend Receives Request
    ↓
Load GTM_RESOURCES from gtm_data.py
    ↓
Extract all unique tags
    ↓
Return JSON Response
    ↓
React State: setResources(data)
    ↓
Render ResourceGrid with data
```

### 2. Filtering Flow

```
User Clicks Tag Filter
    ↓
handleTagChange(tag)
    ↓
Update selectedTags State
    ↓
filteredResources = resources.filter(...)
    ↓
ResourceGrid Re-renders with filtered data
```

### 3. Video Playback Flow

```
User Clicks "Watch Demo"
    ↓
setShowVideo(true)
    ↓
VideoModal Renders
    ↓
<video src={videoUrl}>
    ↓
Browser Requests Video from Blob Storage
    ↓
Blob Storage Returns MP4 Stream
    ↓
Video Player Displays
```

## Component Hierarchy

```
App
├── Header
├── FilterBar
│   └── Filter Tags (buttons)
├── ResourceGrid
│   └── ResourceCard (multiple)
│       ├── Header Section
│       ├── Description
│       ├── Tags
│       ├── Demo Button
│       └── VideoModal (conditional)
│           ├── Header
│           ├── Video Player
│           └── Close Button
└── Error Display (conditional)
```

## State Management

### App Level State

```javascript
- resources: []              // All GTM resources
- selectedTags: []           // Currently selected filter tags
- allTags: []                // All unique tags
- loading: false             // Loading state
- error: null                // Error messages
```

### Component Level State

```javascript
ResourceCard
- showVideo: false           // Video modal visibility

App
- All above states managed at App level
```

## Technology Stack

### Frontend
- **React** 18.2.0 - UI framework
- **Tailwind CSS** 3.3.2 - Styling
- **Axios** 1.4.0 - HTTP client
- **React Scripts** 5.0.1 - Build tool

### Backend
- **Flask** 2.3.2 - Web framework
- **Flask-CORS** 4.0.0 - CORS support
- **Azure Storage Blob** 12.17.0 - Blob storage client
- **Python-dotenv** 1.0.0 - Environment variables
- **Requests** 2.31.0 - HTTP library

### Infrastructure
- **Node.js** - Frontend runtime
- **Python** - Backend runtime
- **Azure Blob Storage** - Video hosting
- **Git** - Version control

## API Response Structure

```json
// Success Response
{
  "id": 1,
  "header": "Title",
  "description": "Description",
  "tags": ["Tag1", "Tag2"],
  "video_url": "https://..."
}

// Error Response
{
  "error": "Error message"
}
```

## Security Considerations

1. **No Authentication Required** - Open portal
2. **CORS Enabled** - Controlled cross-origin requests
3. **HTTPS Only** (Production) - Encrypted communication
4. **SAS URLs** - Time-limited blob access (optional)
5. **Input Validation** - Tag validation in filters

## Deployment Architecture

### Development
```
Local Machine
├── Frontend (localhost:3000)
├── Backend (localhost:5000)
└── Azure Blob Storage (cloud)
```

### Production
```
CDN → Static Frontend (Netlify/Vercel)
         ↓ API calls
      Backend API (Heroku/Azure App Service)
         ↓ Video URLs
      Azure Blob Storage
```

## Scalability Considerations

1. **Frontend Caching** - Cache API responses
2. **API Caching** - Cache resource queries
3. **CDN for Videos** - Faster video delivery
4. **Database** - Add if static data becomes dynamic
5. **Load Balancing** - Multiple backend instances
6. **Rate Limiting** - Prevent abuse

## Performance Optimization

1. **Lazy Loading** - Load videos on demand
2. **Code Splitting** - Split React bundles
3. **Minification** - Reduce file sizes
4. **Gzip Compression** - Compress responses
5. **Image Optimization** - Optimize thumbnails
6. **Caching Headers** - Browser caching

## Error Handling

```
Frontend
├── Network Errors → Display error message
├── API Errors → Fallback UI
└── Video Errors → Retry mechanism

Backend
├── Missing Resource → 404 Response
├── Server Errors → 500 Response
└── CORS Errors → 403 Response
```

## Database Schema (Future)

If moving to database-driven model:

```sql
-- Resources Table
CREATE TABLE resources (
  id INT PRIMARY KEY,
  header VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
  id INT PRIMARY KEY,
  name VARCHAR(100) UNIQUE
);

-- Resource Tags Relationship
CREATE TABLE resource_tags (
  resource_id INT,
  tag_id INT,
  FOREIGN KEY (resource_id) REFERENCES resources(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

## Monitoring & Logging

### Frontend Monitoring
- Error tracking (Sentry)
- User analytics (Google Analytics)
- Performance metrics (Lighthouse)

### Backend Monitoring
- API response times
- Error rates
- Blob storage access logs
- Application logs

---

**Architecture Version**: 1.0.0  
**Last Updated**: May 2026
