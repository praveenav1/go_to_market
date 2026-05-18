# GTM Repository - API Documentation

## Base URL

Development: `http://localhost:5000`  
Production: `https://your-api-domain.com`

## Endpoints

### 1. Get All Resources

**Request**
```http
GET /api/resources
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "header": "Product Launch Strategy",
    "description": "Comprehensive guide to launching new products in emerging markets with proven GTM frameworks and success metrics.",
    "tags": ["Launch", "Strategy", "Product"],
    "video_url": "https://youraccount.blob.core.windows.net/gtm-videos/product-launch-demo.mp4"
  },
  {
    "id": 2,
    "header": "Market Analysis & Segmentation",
    "description": "Deep dive into market research methodologies and customer segmentation strategies for targeted GTM campaigns.",
    "tags": ["Market Research", "Analysis", "Segmentation"],
    "video_url": "https://youraccount.blob.core.windows.net/gtm-videos/market-analysis-demo.mp4"
  }
]
```

**Error Response (500)**
```json
{
  "error": "Failed to fetch resources"
}
```

---

### 2. Get Single Resource

**Request**
```http
GET /api/resources/{id}
```

**Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | integer | Yes | Resource ID |

**Example**
```http
GET /api/resources/1
```

**Response (200 OK)**
```json
{
  "id": 1,
  "header": "Product Launch Strategy",
  "description": "Comprehensive guide to launching new products in emerging markets with proven GTM frameworks and success metrics.",
  "tags": ["Launch", "Strategy", "Product"],
  "video_url": "https://youraccount.blob.core.windows.net/gtm-videos/product-launch-demo.mp4"
}
```

**Error Response (404)**
```json
{
  "error": "Resource not found"
}
```

---

### 3. Get All Tags

**Request**
```http
GET /api/tags
```

**Response (200 OK)**
```json
[
  "Analysis",
  "Competitive",
  "Customer Success",
  "Digital",
  "Enablement",
  "Framework",
  "Intelligence",
  "Launch",
  "Market Research",
  "Marketing",
  "Product",
  "Retention",
  "Sales",
  "Segmentation",
  "Strategy",
  "Tools"
]
```

---

### 4. Health Check

**Request**
```http
GET /api/health
```

**Response (200 OK)**
```json
{
  "status": "healthy",
  "service": "GTM Repository API"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Response Headers

All responses include the following headers:

```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

---

## Data Model

### Resource Object

```json
{
  "id": "integer",
  "header": "string (max 255 characters)",
  "description": "string (max 1000 characters)",
  "tags": ["string array"],
  "video_url": "string (valid URL)"
}
```

### Field Descriptions

- **id**: Unique identifier for the resource
- **header**: Resource title/heading
- **description**: Detailed description of the resource
- **tags**: Array of category tags for filtering
- **video_url**: URL to demo video in blob storage

---

## CORS Configuration

The API supports CORS for frontend integration. By default, all origins are allowed in development.

**Production Configuration** (update in `.env`):
```
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

---

## Rate Limiting

Currently not implemented. Can be added using Flask-Limiter if needed.

---

## Caching

### Recommended Client-Side Caching

```javascript
// Cache responses for 1 hour
const CACHE_DURATION = 3600000; // milliseconds

// In frontend, store API responses
sessionStorage.setItem('gtm-resources', JSON.stringify(resources));
```

---

## Example Requests

### Using cURL

```bash
# Get all resources
curl http://localhost:5000/api/resources

# Get single resource
curl http://localhost:5000/api/resources/1

# Get all tags
curl http://localhost:5000/api/tags

# Health check
curl http://localhost:5000/api/health
```

### Using JavaScript/Fetch

```javascript
// Get all resources
fetch('http://localhost:5000/api/resources')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Get single resource
fetch('http://localhost:5000/api/resources/1')
  .then(response => response.json())
  .then(data => console.log(data));

// Get all tags
fetch('http://localhost:5000/api/tags')
  .then(response => response.json())
  .then(tags => console.log(tags));
```

### Using Python/Requests

```python
import requests

# Get all resources
response = requests.get('http://localhost:5000/api/resources')
resources = response.json()

# Get single resource
response = requests.get('http://localhost:5000/api/resources/1')
resource = response.json()

# Get all tags
response = requests.get('http://localhost:5000/api/tags')
tags = response.json()
```

---

## Pagination

Pagination not currently implemented. All resources are returned at once. Consider implementing for large datasets:

```
GET /api/resources?page=1&limit=10
```

---

## Filtering

Filtering is handled client-side in the frontend based on tags. Server-side filtering can be added:

```
GET /api/resources?tag=Launch&tag=Strategy
```

---

## Rate Limiting (Future)

To implement rate limiting, install Flask-Limiter:

```bash
pip install Flask-Limiter
```

Then in `app.py`:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/resources')
@limiter.limit("30/minute")
def get_resources():
    # ...
```

---

## Versioning

Future API versions can be supported with URL prefixes:

```
/api/v1/resources
/api/v2/resources
```

---

## Support

For API-related issues, check:
1. Backend is running on port 5000
2. CORS is properly configured
3. Azure Blob Storage credentials are valid
4. Network connectivity between frontend and backend

---

**Last Updated**: May 2026  
**Version**: 1.0.0
